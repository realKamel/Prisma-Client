import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  viewChild,
  ElementRef,
  NgZone,
  input,
  output,
} from '@angular/core';
import { AuthService } from '../../../../core/Services/auth';
import { ISendCode } from '../../../../core/Models/Forgot-Password';
// import { AuthService } from '../../../core/Services/auth.service';
// import { ISendCode } from '../../../core/Models/Auth/send-code.model';

@Component({
  selector: 'app-step-otp',

  imports: [],
  templateUrl: './step-otp.html',
  styleUrls: ['./step-otp.css'],
})
export class StepOtpComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  readonly contactValue = input('');
  readonly verified = output<void>();
  readonly back = output<void>();

  readonly hiddenInput = viewChild.required<ElementRef<HTMLInputElement>>('hiddenInput');

  value = signal<string>('');
  loading = signal<boolean>(false);
  hasError = signal<boolean>(false);
  shaking = signal<boolean>(false);
  resendDisabled = signal<boolean>(true);
  focused = signal<boolean>(false);
  activeIndex = signal<number>(0);

  // Modern countdown state using an interval signal
  private timer = signal<number>(60);

  // Computed state derivations remove the need for manual UI updates and NgZone bypasses
  countdown = computed(() => {
    const remaining = this.timer();
    return remaining <= 0
      ? ''
      : `(${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')})`;
  });

  private timerId: any;

  digits = computed<string[]>(() => {
    const val = this.value();
    return Array.from({ length: 6 }, (_, i) => val[i] ?? '');
  });

  ngOnInit() {
    this.startCountdown();
    setTimeout(() => this.hiddenInput().nativeElement.focus(), 100);
  }

  ngOnDestroy() {
    clearInterval(this.timerId);
  }

  focusAt(index: number) {
    const input = this.hiddenInput().nativeElement;
    if (!input) return;
    input.focus();
    const pos = Math.min(index, this.value().length);
    setTimeout(() => {
      input.setSelectionRange(pos, pos);
      this.activeIndex.set(pos);
    }, 0);
  }

  onFocus() {
    this.focused.set(true);
    this.activeIndex.set(Math.min(this.activeIndex(), this.value().length));
  }

  onBlur() {
    this.focused.set(false);
  }

  onHiddenInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = clean;
    this.value.set(clean);
    this.hasError.set(false);
    this.activeIndex.set(input.selectionStart ?? clean.length);
  }

  onHiddenKeydown(event: KeyboardEvent) {
    const input = this.hiddenInput().nativeElement;
    if (!input) return;

    setTimeout(() => {
      this.activeIndex.set(input.selectionStart ?? this.value().length);
    }, 0);

    if (event.key === 'Backspace' && this.value().length === 0) {
      event.preventDefault();
    }
  }

  code: ISendCode = {} as ISendCode;
  verify() {
    if (this.value().length < 6) {
      this.triggerError();
      return;
    }
    this.loading.set(true);
    this.code = {
      Code: this.value(),
      Email: this.contactValue(),
    };
    this.authService.sendConfirm(this.code).subscribe({
      next: () => {
        this.verified.emit();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private triggerError() {
    this.hasError.set(true);
    this.shaking.set(true);
    setTimeout(() => this.shaking.set(false), 400);
    this.hiddenInput().nativeElement.focus();
  }

  private startCountdown() {
    clearInterval(this.timerId);
    this.timer.set(60);
    this.resendDisabled.set(true);

    this.timerId = setInterval(() => {
      this.timer.update((time) => {
        if (time <= 1) {
          clearInterval(this.timerId);
          this.resendDisabled.set(false);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }
}
