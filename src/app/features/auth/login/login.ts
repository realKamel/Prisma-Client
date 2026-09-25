import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail } from '@ng-icons/lucide';
import { phosphorEyeBold, phosphorEyeSlashBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorDeviceMobileCameraDuotone } from '@ng-icons/phosphor-icons/duotone';
import { phosphorWarningCircle } from '@ng-icons/phosphor-icons/regular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgmMotionDirective, type TargetAndTransition } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import { UserLogin } from '../../../core/Models/UserLogin';
import { IProblemDetails } from '../../../core/Models/problemDetails';
import { AuthService } from '../../../core/Services/auth';
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
import { AppValidators } from '../../../shared/validators/phone-number-validator';
import { applyServerErrors, serverErrorOf } from '../../../shared/validators/server-errors';
type LoginMethod = 'phone' | 'email';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, TranslatePipe, NgmMotionDirective, NgIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
  viewProviders: [
    provideIcons({
      phosphorDeviceMobileCameraDuotone,
      lucideMail,
      phosphorWarningCircle,
      phosphorEyeBold,
      phosphorEyeSlashBold,
    }),
  ],
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  protected readonly authService = inject(AuthService);

  // Form Controls
  protected readonly loginForm = new FormGroup({
    mobile: new FormControl<string | null>(null, [
      Validators.required,
      AppValidators.egyptianPhoneNumber,
    ]),
    email: new FormControl<string | null>(null),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  // Signals State
  protected readonly submitted = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly loginMethod = signal<LoginMethod>('phone');

  // Animation & Field State
  private readonly blurredControls = signal<Set<string>>(new Set());
  private readonly shakeRequests = signal<Map<string, number>>(new Map());

  // Animation constants exposed to template
  protected readonly cardInitial = loginCardInitial;
  protected readonly cardEntrance = loginCardEntrance;
  protected readonly cardHover = loginCardHover;
  protected readonly cardEntranceOptions = loginCardEntranceTransition;
  protected readonly layoutTransition = loginLayoutTransition;
  protected readonly switchTransition = loginSwitchTransition;
  protected readonly invalidFieldTransition = invalidFieldTransition;
  protected readonly serverErrorOf = serverErrorOf;

  get f() {
    return this.loginForm.controls;
  }

  setLoginMethod(method: LoginMethod): void {
    if (this.loginMethod() === method) return;
    this.loginMethod.set(method);

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

    mobile.updateValueAndValidity({ emitEvent: false });
    email.updateValueAndValidity({ emitEvent: false });
  }

  // Sanitize numeric inputs (e.g. mobile) directly
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/\D/g, '');
    this.loginForm.controls.mobile.setValue(numericValue, { emitEvent: false });
    this.loginForm.controls.mobile.markAsDirty();
  }

  protected markControlFocused(controlName: string): void {
    this.blurredControls.update((set) => {
      const next = new Set(set);
      next.delete(controlName);
      return next;
    });
  }

  protected markControlBlurred(controlName: string): void {
    const control = this.loginForm.get(controlName);

    this.blurredControls.update((set) => new Set(set).add(controlName));

    if (control?.dirty && control.invalid) {
      this.shakeRequests.update((map) => {
        const next = new Map(map);
        next.set(controlName, (next.get(controlName) ?? 0) + 1);
        return next;
      });
    }
  }

  protected fieldShake(controlName: string): TargetAndTransition {
    const control = this.loginForm.get(controlName);
    const hasShaken = (this.shakeRequests().get(controlName) ?? 0) > 0;
    const isBlurred = this.blurredControls().has(controlName);

    if (!control?.dirty || !control.invalid || !isBlurred) {
      return invalidFieldRest;
    }

    return hasShaken ? { x: [...invalidFieldShake.x] } : invalidFieldRest;
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
        void this.router.navigate(['/home']);
      },
      error: (ref) => {
        const problem = (ref as { error?: IProblemDetails })?.error;
        const unmapped = applyServerErrors(this.loginForm, problem);

        if (unmapped.length) {
          toast.error(
            problem?.detail ?? problem?.title ?? this.translate.instant('AUTH.LOGIN_FAILED'),
          );
        }
      },
    });
  }
}
