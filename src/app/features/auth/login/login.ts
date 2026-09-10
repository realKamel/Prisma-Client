import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UserLogin } from '../../../core/Models/UserLogin';
import { IProblemDetails } from '../../../core/Models/problemDetails';
import { AuthService } from '../../../core/Services/auth';
import { NgmMotionDirective, type TargetAndTransition } from '@scripttype/ng-motion';
import { AppValidators } from '../../../shared/validators/phone-number-validator';
import { applyServerErrors, serverErrorOf } from '../../../shared/validators/server-errors';
import { toast } from 'ngx-sonner';
import {
  loginCardEntrance,
  loginCardEntranceTransition,
  loginCardHover,
  loginCardInitial,
  loginLayoutTransition,
  loginSwitchTransition,
} from '../../../core/animations/login.animations';
import {
  invalidFieldRest,
  invalidFieldShake,
  invalidFieldTransition,
} from '../../../core/animations/motion.animations';

type LoginMethod = 'phone' | 'email';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, TranslatePipe, NgmMotionDirective],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  protected readonly submitted = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly loginMethod = signal<LoginMethod>('phone');

  /** Template helper: reads the API validation message set on a control. */
  protected readonly serverErrorOf = serverErrorOf;

  protected readonly cardInitial = loginCardInitial;
  protected readonly cardEntrance = loginCardEntrance;
  protected readonly cardHover = loginCardHover;
  protected readonly cardEntranceOptions = loginCardEntranceTransition;
  protected readonly layoutTransition = loginLayoutTransition;
  protected readonly switchTransition = loginSwitchTransition;
  protected readonly invalidFieldTransition = invalidFieldTransition;
  private readonly blurredControls = signal<Record<string, boolean>>({});
  private readonly shakeRequests = signal<Record<string, number>>({});

  protected readonly loginForm = this.fb.group({
    mobile: this.fb.control<string | null>(null, [AppValidators.egyptianPhoneNumber]),
    email: this.fb.control<string | null>(null, [AppValidators.gmailValidator]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
  });

  constructor() {
    // Keep the active field's required validator in sync with the toggle, and
    // clear the inactive one so it doesn't block submission.
    effect(() => {
      const method = this.loginMethod();
      untracked(() => this.applyMethodValidators(method));
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  setLoginMethod(method: LoginMethod): void {
    this.loginMethod.set(method);
  }

  private applyMethodValidators(method: LoginMethod): void {
    const { mobile, email } = this.loginForm.controls;

    if (method === 'phone') {
      email.reset(null, { emitEvent: false });
      email.clearValidators();
      mobile.setValidators([Validators.required, AppValidators.egyptianPhoneNumber]);
    } else {
      mobile.reset(null, { emitEvent: false });
      mobile.clearValidators();
      email.setValidators([Validators.required, AppValidators.gmailValidator]);
    }

    mobile.updateValueAndValidity();
    email.updateValueAndValidity();
  }

  // Allow only digits in phone input
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/[^0-9]/g, '');
    const control = this.loginForm.controls.mobile;
    control.setValue(numericValue, { emitEvent: false });
    control.markAsDirty();
    control.updateValueAndValidity({ emitEvent: false });
  }

  // Trigger email re-validation on input
  onEmailInput(): void {
    const emailControl = this.loginForm.controls.email;
    if (emailControl.value) {
      emailControl.updateValueAndValidity();
    }
  }

  protected markControlFocused(controlName: string): void {
    queueMicrotask(() => {
      this.blurredControls.update((controls) => ({ ...controls, [controlName]: false }));
    });
  }

  protected markControlBlurred(controlName: string): void {
    queueMicrotask(() => {
      this.blurredControls.update((controls) => ({ ...controls, [controlName]: true }));
      const control = this.loginForm.get(controlName);
      if (control?.dirty && control.invalid) {
        this.shakeRequests.update((requests) => ({
          ...requests,
          [controlName]: (requests[controlName] ?? 0) + 1,
        }));
      }
    });
  }

  protected fieldShake(controlName: string): TargetAndTransition {
    const control = this.loginForm.get(controlName);
    const requestCount = this.shakeRequests()[controlName] ?? 0;
    if (!control?.dirty || !control.invalid || !this.blurredControls()[controlName]) {
      return invalidFieldRest;
    }

    return requestCount >= 0 ? { x: [...invalidFieldShake.x] } : invalidFieldRest;
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    const { mobile, email, password } = this.loginForm.getRawValue();
    const loginData: UserLogin = {
      mobile: mobile ?? undefined,
      email: email ?? undefined,
      password,
    };

    this.authService.loginEmail(loginData).subscribe({
      next: () => {
        this.router.navigate(['/home']); // HOME PAGE
      },
      error: (ref) => {
        const problem = (ref as { error?: IProblemDetails })?.error;
        const unmapped = applyServerErrors(this.loginForm, problem);

        // Toast only keys that don't map to a form field; the global
        // interceptor already toasts non-field errors (e.g. wrong password).
        if (unmapped.length) {
          toast.error(problem?.detail ?? problem?.title ?? 'تعذر تسجيل الدخول، حاول مرة أخرى');
        }
      },
    });
  }
}
