import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UserLogin } from '../../../core/Models/UserLogin';
import { IProblemDetails } from '../../../core/Models/problemDetails';
import { AuthService } from '../../../core/Services/auth';
import { AppValidators } from '../../../shared/validators/phone-number-validator';
import { applyServerErrors, serverErrorOf } from '../../../shared/validators/server-errors';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm: FormGroup;
  protected readonly submitted = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly loginMethod = signal<'phone' | 'email'>('phone');
  protected readonly authService = inject(AuthService);

  /** Template helper: reads the API validation message set on a control. */
  protected readonly serverErrorOf = serverErrorOf;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor() {
    this.loginForm = this.fb.group({
      // Both fields exist, but only one is required based on toggle
      mobile: [null, [AppValidators.egyptianPhoneNumber]],
      email: [null, [AppValidators.gmailValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    // Set initial validation based on default method
    this.updateValidators();
  }
  user: UserLogin = {} as UserLogin;

  get f() {
    return this.loginForm.controls;
  }

  // Toggle between phone/email login
  setLoginMethod(method: 'phone' | 'email'): void {
    this.loginMethod.set(method);
    this.updateValidators();
    // Clear the other field when switching
    if (method === 'phone') {
      this.loginForm.get('email')?.setValue(null);
      this.loginForm.get('email')?.clearValidators();
      this.loginForm.get('email')?.updateValueAndValidity();
    } else {
      this.loginForm.get('mobile')?.setValue(null);
      this.loginForm.get('mobile')?.clearValidators();
      this.loginForm.get('mobile')?.updateValueAndValidity();
    }
  }

  // Update validators based on selected method
  updateValidators(): void {
    if (this.loginMethod() === 'phone') {
      this.loginForm
        .get('mobile')
        ?.setValidators([Validators.required, AppValidators.egyptianPhoneNumber]);
      this.loginForm.get('email')?.clearValidators();
    } else {
      this.loginForm
        .get('email')
        ?.setValidators([Validators.required, AppValidators.gmailValidator]);
      this.loginForm.get('mobile')?.clearValidators();
    }
    this.loginForm.get('mobile')?.updateValueAndValidity();
    this.loginForm.get('email')?.updateValueAndValidity();
  }

  // Allow only digits in phone input
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/[^0-9]/g, '');
    this.loginForm.get('mobile')?.setValue(numericValue, { emitEvent: false });
  }

  // Trigger email re-validation on input
  onEmailInput(): void {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.value) {
      emailControl.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    this.submitted.set(true);

    this.loginForm.get('mobile')?.markAsTouched();

    this.loginForm.get('email')?.markAsTouched();

    this.loginForm.get('password')?.markAsTouched();

    if (this.loginForm.invalid) return;

    const loginData = {
      email: this.loginForm.get('email')?.value,
      mobile: this.loginForm.get('mobile')?.value,
      password: this.loginForm.get('password')?.value,
    };
    this.user = loginData;
    this.authService.loginEmail(this.user).subscribe({
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
