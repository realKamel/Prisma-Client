import { ChangeDetectorRef, Component, inject, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/Services/auth';
import { StudentRegister } from '../../../core/Models/StudentRegister';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;

  // Success modal state
  showSuccessModal = false;
  countdown = 5;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  registeredName = '';

  // Server-side errors surfaced after API call
  serverErrors: { email?: string; mobile?: string; general?: string } = {};
  private _lastSubmittedEmail = '';

  studentToReg: StudentRegister = {} as StudentRegister;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      firstName:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), this.nameValidator]],
      secondName:      ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), this.nameValidator]],
      thirdName:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), this.nameValidator]],
      lastName:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), this.nameValidator]],
      mobile:          ['', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
      email:           ['', [Validators.required, Validators.maxLength(254), this.gmailValidator.bind(this)]],
      password:        ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      grade:           ['', Validators.required],
      parentMobile:    ['', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]]
    }, {
      validators: [this.passwordMatchValidator, this.phoneNumbersNotEqualValidator]
    });
  }

  private authService = inject(AuthService);
  private ngZone      = inject(NgZone);
  private cdr         = inject(ChangeDetectorRef);

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  get f() { return this.registerForm.controls; }

  // --------------------------------------------------------------------------
  // Success modal
  // --------------------------------------------------------------------------
  private openSuccessModal(): void {
    this.registeredName = this.registerForm.get('firstName')?.value || '';
    this.showSuccessModal = true;
    this.countdown = 5;

    // ngZone.run ensures every setInterval tick triggers Angular change detection
    // Without this the countdown variable updates in memory but the template
    // never re-renders, so the number appears frozen.
    this.ngZone.run(() => {
      this.countdownInterval = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.navigateToLogin();
        }
      }, 1000);
    });
  }

  navigateToLogin(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.router.navigate(['/login']);
  }

  dismissModal(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.showSuccessModal = false;
    this.submitted = false;
  }

  // --------------------------------------------------------------------------
  // Gmail-only validator
  // Accepts only addresses that end with @gmail.com
  // --------------------------------------------------------------------------
  gmailValidator(control: AbstractControl): ValidationErrors | null {
    const raw = control.value;
    if (!raw) return null;
    const email = raw.trim().toLowerCase();

    // Must end with @gmail.com exactly
    if (!email.endsWith('@gmail.com')) return { invalidGmail: true };

    // Must match full format: non-empty local part, no spaces
    const formatRegex = /^[^\s@]+@gmail\.com$/;
    if (!formatRegex.test(email)) return { invalidGmail: true };

    // Local part must not start or end with a dot, or contain two consecutive dots
    const local = email.split('@')[0];
    if (local.startsWith('.') || local.endsWith('.')) return { invalidGmail: true };
    if (local.includes('..')) return { invalidGmail: true };

    return null;
  }

  // --------------------------------------------------------------------------
  // Name validator: letters (Arabic + Latin), spaces, hyphens, apostrophes, dots
  // --------------------------------------------------------------------------
  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s'\-.]+$/;
    return nameRegex.test(value) ? null : { invalidName: true };
  }

  // --------------------------------------------------------------------------
  // Password validator: mirrors every backend FluentValidation rule
  // --------------------------------------------------------------------------
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (value.length < 8)                                              errors['minlength']        = true;
    if (value.length > 128)                                            errors['maxlength']        = true;
    if (!/[A-Z]/.test(value))                                          errors['missingUppercase'] = true;
    if (!/[a-z]/.test(value))                                          errors['missingLowercase'] = true;
    if (!/\d/.test(value))                                             errors['missingDigit']     = true;
    if (!/[!@#$%^&*()\-_+=\[\]{};':"\\|,.<>/?]/.test(value))          errors['missingSpecial']   = true;
    if (value.includes(' '))                                           errors['hasSpaces']        = true;

    return Object.keys(errors).length ? errors : null;
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password        = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  phoneNumbersNotEqualValidator(form: AbstractControl): ValidationErrors | null {
    const mobile       = form.get('mobile')?.value;
    const parentMobile = form.get('parentMobile')?.value;
    if (mobile && parentMobile && mobile === parentMobile) {
      return { samePhoneNumbers: true };
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Password strength indicator (display only)
  // --------------------------------------------------------------------------
  getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (!password) return 'weak';
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password))   score++;
    if (/[!@#$%^&*()\-_+=\[\]{};':"\\|,.<>/?]/.test(password)) score++;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  onPasswordInput(): void {
    const password = this.registerForm.get('password')?.value;
    this.passwordStrength = password ? this.getPasswordStrength(password) : null;
  }

  onEmailInput(): void {
    // Re-run client validators on every keystroke for real-time feedback
    const emailControl = this.registerForm.get('email');
    if (emailControl?.value) emailControl.updateValueAndValidity();
    // Server error is cleared on blur (onEmailBlur), not here,
    // so the error message stays visible while the user is typing a fix.
  }

  onEmailBlur(): void {
    const emailControl = this.registerForm.get('email');
    if (!this.serverErrors.email) return;
    const current  = emailControl?.value?.trim().toLowerCase() ?? '';
    const original = this._lastSubmittedEmail;
    // Only dismiss the server error once the value has actually changed
    if (current !== original) {
      this.serverErrors = { ...this.serverErrors, email: undefined };
    }
  }

  onPhoneInput(event: Event, controlName: string): void {
    const input        = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/[^0-9]/g, '');
    this.registerForm.get(controlName)?.setValue(numericValue, { emitEvent: false });
    if (this.serverErrors.mobile) {
      this.serverErrors = { ...this.serverErrors, mobile: undefined };
    }
  }

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------
  onSubmit(): void {
    this.serverErrors = {};

    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this._lastSubmittedEmail = this.registerForm.get('email')?.value?.trim().toLowerCase() ?? '';
    this.studentToReg = this.registerForm.value;

    this.authService.register(this.studentToReg).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
        this.openSuccessModal();
      },
      error: (err) => {
        // Wrap in ngZone.run so the template re-renders even if HttpClient
        // delivered this callback outside Angular's zone.
        this.ngZone.run(() => {
          this.loading = false;

          // The backend Result.Failure() can surface the error in several shapes.
          // We try every known path and fall back to an empty string.
          const body = err?.error ?? {};
          const message: string = (
            body?.message        // { message: "..." }
            ?? body?.error       // { error: "..." }
            ?? body?.errors?.[0] // { errors: ["..."] }
            ?? body?.title       // ASP.NET ProblemDetails
            ?? (typeof body === 'string' ? body : '')
          ).toString().toLowerCase();

          console.error('[Register] API error body:', body);
          console.error('[Register] Parsed message:', message);

          const emailVal = this.registerForm.get('email')?.value?.trim().toLowerCase() ?? '';

          // --- Email already exists ---
          // Backend returns Result.Failure(existingUser.Email) so the message
          // IS the email string. Also catches "email"/"duplicate" keywords.
          if (
            (emailVal && message === emailVal) ||
            (emailVal && message.includes(emailVal)) ||
            message.includes('email') ||
            message.includes('duplicate')
          ) {
            // Replace the whole object — mutation alone won't trigger change detection
            this.serverErrors = { ...this.serverErrors, email: 'هذا البريد الإلكتروني مسجّل بالفعل' };
            this.registerForm.get('email')?.markAsTouched();

          // --- Phone already exists ---
          } else if (
            message.includes('phone') ||
            message.includes('mobile') ||
            message.includes('number')
          ) {
            this.serverErrors = { ...this.serverErrors, mobile: 'هذا الرقم مسجّل بالفعل' };
            this.registerForm.get('mobile')?.markAsTouched();

          // --- Fallback ---
          } else {
            this.serverErrors = { ...this.serverErrors, general: 'حدث خطأ، يرجى المحاولة مرة أخرى' };
          }

          // Force view update in case we're still outside the zone
          this.cdr.markForCheck();
        });
      }
    });
  }

  getFullName(): string {
    const f = this.registerForm.value;
    return [f.firstName, f.secondName, f.thirdName, f.lastName].filter(Boolean).join(' ');
  }

  // First failing password error -> single Arabic message for the template
  getPasswordError(): string {
    const errors = this.registerForm.get('password')?.errors;
    if (!errors) return '';
    if (errors['required'])          return 'كلمة المرور مطلوبة';
    if (errors['minlength'])         return 'كلمة المرور لازم تكون 8 حروف على الأقل';
    if (errors['maxlength'])         return 'كلمة المرور لا يمكن أن تتجاوز 128 حرفاً';
    if (errors['hasSpaces'])         return 'كلمة المرور لا يجب أن تحتوي على مسافات';
    if (errors['missingUppercase'])  return 'كلمة المرور لازم تحتوي على حرف كبير واحد على الأقل';
    if (errors['missingLowercase'])  return 'كلمة المرور لازم تحتوي على حرف صغير واحد على الأقل';
    if (errors['missingDigit'])      return 'كلمة المرور لازم تحتوي على رقم واحد على الأقل';
    if (errors['missingSpecial'])    return 'كلمة المرور لازم تحتوي على رمز خاص (مثل: @، #، !)';
    return '';
  }
}