import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ISendCode } from '../../../../core/Models/Forgot-Password';
import { AuthService } from '../../../../core/Services/auth';
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

  public readonly contactValue = input('');
  public readonly verified = output<void>();
  public readonly back = output<void>();

  protected readonly hiddenInput = viewChild.required<ElementRef<HTMLInputElement>>('hiddenInput');

  protected readonly value = signal<string>('');
  protected readonly loading = signal<boolean>(false);
  protected readonly hasError = signal<boolean>(false);
  protected readonly shaking = signal<boolean>(false);
  protected readonly resendDisabled = signal<boolean>(true);
  protected readonly focused = signal<boolean>(false);
  protected readonly activeIndex = signal<number>(0);

  // Modern countdown state using an interval signal
  private readonly timer = signal<number>(60);

  // Computed state derivations remove the need for manual UI updates and NgZone bypasses
  protected readonly countdown = computed(() => {
    const remaining = this.timer();
    return remaining <= 0
      ? ''
      : `(${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')})`;
  });

  private timerId = 0;

  protected readonly digits = computed<string[]>(() => {
    const val = this.value();
    return Array.from({ length: 6 }, (_, i) => val[i] ?? '');
  });

  public ngOnInit() {
    this.startCountdown();
    setTimeout(() => this.hiddenInput().nativeElement.focus(), 100);
  }

  public ngOnDestroy() {
    clearInterval(this.timerId);
  }

  protected focusAt(index: number) {
    const input = this.hiddenInput().nativeElement;
    if (!input) return;
    input.focus();
    const pos = Math.min(index, this.value().length);
    setTimeout(() => {
      input.setSelectionRange(pos, pos);
      this.activeIndex.set(pos);
    }, 0);
  }

  protected onFocus() {
    this.focused.set(true);
    this.activeIndex.set(Math.min(this.activeIndex(), this.value().length));
  }

  protected onBlur() {
    this.focused.set(false);
  }

  protected onHiddenInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = clean;
    this.value.set(clean);
    this.hasError.set(false);
    this.activeIndex.set(input.selectionStart ?? clean.length);
  }

  protected onHiddenKeydown(event: KeyboardEvent) {
    const input = this.hiddenInput().nativeElement;
    if (!input) return;

    setTimeout(() => {
      this.activeIndex.set(input.selectionStart ?? this.value().length);
    }, 0);

    if (event.key === 'Backspace' && this.value().length === 0) {
      event.preventDefault();
    }
  }

  protected code: ISendCode = {} as ISendCode;
  protected verify() {
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
