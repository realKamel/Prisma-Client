import {
  Component, EventEmitter, Input, OnDestroy, OnInit,
  Output, ViewChild, ElementRef, NgZone, ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/Services/auth';
import { ISendCode } from '../../../../core/Models/Forgot-Password';

@Component({
  selector: 'app-step-otp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-otp.html',
  styleUrls: ['./step-otp.css'],
})
export class StepOtpComponent implements OnInit, OnDestroy {
  @Input()  contactValue = '';
  @Output() verified = new EventEmitter<void>();
  @Output() back     = new EventEmitter<void>();

  @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;

  value          = '';
  loading        = false;
  hasError       = false;
  shaking        = false;
  resendDisabled = true;
  countdown      = '';
  focused        = false;
  activeIndex    = 0;

  private timerId: any;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  get digits(): string[] {
    return Array.from({ length: 6 }, (_, i) => this.value[i] ?? '');
  }

  ngOnInit() {
    this.startCountdown(60);
    setTimeout(() => this.hiddenInput?.nativeElement.focus(), 100);
  }

  ngOnDestroy() {
    clearInterval(this.timerId);
  }

  // Called when user clicks a specific digit box
  focusAt(index: number) {
    const input = this.hiddenInput?.nativeElement;
    if (!input) return;
    input.focus();
    // Clamp: can't place cursor beyond current value length
    const pos = Math.min(index, this.value.length);
    // Small timeout lets the focus settle before setSelectionRange
    setTimeout(() => {
      input.setSelectionRange(pos, pos);
      this.activeIndex = pos;
      this.cdr.markForCheck();
    }, 0);
  }

  onFocus() {
    this.focused = true;
    this.activeIndex = Math.min(this.activeIndex, this.value.length);
  }

  onBlur() {
    this.focused = false;
  }

  onHiddenInput(event: Event) {
    const input  = event.target as HTMLInputElement;
    const clean  = input.value.replace(/\D/g, '').slice(0, 6);
    input.value  = clean;
    this.value   = clean;
    this.hasError = false;
    // After input, active index follows the cursor
    this.activeIndex = input.selectionStart ?? clean.length;
    this.cdr.markForCheck();
  }

  onHiddenKeydown(event: KeyboardEvent) {
    const input = this.hiddenInput?.nativeElement;
    if (!input) return;

    // After keydown, update activeIndex to follow cursor movement
    setTimeout(() => {
      this.activeIndex = input.selectionStart ?? this.value.length;
      this.cdr.markForCheck();
    }, 0);

    if (event.key === 'Backspace' && this.value.length === 0) {
      event.preventDefault();
    }
  }
  code:ISendCode = {} as ISendCode
  verify() {
    if (this.value.length < 6) { this.triggerError(); return; }
    this.loading = true;
    this.code={
      Code: this.value,
      Email:  this.contactValue
    };
    this.authService.sendConfirm(this.code).subscribe({
      next:()=>{
        this.verified.emit();
      },
      error:()=>{
        this.loading = false;
      }
    })
  }

  // resend() {
  //   this.value       = '';
  //   this.hasError    = false;
  //   this.activeIndex = 0;
  //   if (this.hiddenInput) this.hiddenInput.nativeElement.value = '';
  //   this.startCountdown(60);
  //   setTimeout(() => this.hiddenInput?.nativeElement.focus(), 50);
  // }

  private triggerError() {
    this.hasError = true;
    this.shaking  = true;
    setTimeout(() => this.shaking = false, 400);
    this.hiddenInput?.nativeElement.focus();
  }

  private startCountdown(seconds: number) {
    clearInterval(this.timerId);
    this.resendDisabled = true;

    let remaining = seconds;
    this.countdown = this.formatTime(remaining);

    this.ngZone.runOutsideAngular(() => {
      this.timerId = setInterval(() => {
        remaining--;
        this.ngZone.run(() => {
          if (remaining <= 0) {
            clearInterval(this.timerId);
            this.countdown      = '';
            this.resendDisabled = false;
          } else {
            this.countdown = this.formatTime(remaining);
          }
          this.cdr.markForCheck();
        });
      }, 1000);
    });
  }

  private formatTime(s: number): string {
    return `(${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')})`;
  }
}