import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/Services/auth';
import { StudentRegister } from '../../../core/Models/StudentRegister';

interface ServerErrors {
  email?: string;
  mobile?: string;
  general?: string;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly registerForm: FormGroup;

  // UI State Primitives
  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly passwordStrength = signal<'weak' | 'medium' | 'strong' | null>(null);

  // Success Modal State
  readonly showSuccessModal = signal(false);
  readonly countdown = signal(5);
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  readonly registeredName = signal('');

  // Toast State
  readonly showErrorToast = signal(false);
  readonly errorToastMessage = signal('');
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Field-Level Validation State
  readonly serverErrors = signal<ServerErrors>({});
  private _lastSubmittedEmail = '';
  private _lastSubmittedMobile = '';

  studentToReg: StudentRegister = {} as StudentRegister;

  // Computed Values replacing old getter methods
  readonly f = computed(() => this.registerForm.controls);

  readonly fullName = computed(() => {
    const f = this.registerForm.value;
    return [f.firstName, f.secondName, f.thirdName, f.lastName].filter(Boolean).join(' ');
  });

  readonly passwordError = computed(() => {
    const errors = this.registerForm.get('password')?.errors;
    if (!errors) return '';
    if (errors['required']) return 'كلمة المرور مطلوبة';
    if (errors['minlength']) return 'كلمة المرور لازم تكون 8 حروف على الأقل';
    if (errors['maxlength']) return 'كلمة المرور لا يمكن أن تتجاوز 128 حرفاً';
    if (errors['hasSpaces']) return 'كلمة المرور لا يجب أن تحتوي على مسافات';
    if (errors['missingUppercase']) return 'كلمة المرور لازم تحتوي على حرف كبير واحد على الأقل';
    if (errors['missingLowercase']) return 'كلمة المرور لازم تحتوي على حرف صغير واحد على الأقل';
    if (errors['missingDigit']) return 'كلمة المرور لازم تحتوي على رقم واحد على الأقل';
    if (errors['missingSpecial']) return 'كلمة المرور لازم تحتوي على رمز خاص (مثل: @، #، !)';
    return '';
  });

  constructor() {
    this.registerForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(20),
            this.nameValidator,
          ],
        ],
        secondName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(20),
            this.nameValidator,
          ],
        ],
        thirdName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(20),
            this.nameValidator,
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(20),
            this.nameValidator,
          ],
        ],
        mobile: ['', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
        email: [
          '',
          [Validators.required, Validators.maxLength(254), this.gmailValidator.bind(this)],
        ],
        password: ['', [Validators.required, this.passwordValidator]],
        confirmPassword: ['', [Validators.required]],
        grade: ['', Validators.required],
        parentMobile: ['', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
      },
      {
        validators: [this.passwordMatchValidator, this.phoneNumbersNotEqualValidator],
      },
    );
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  // --------------------------------------------------------------------------
  // Toast Action Pipeline
  // --------------------------------------------------------------------------
  private showToast(message: string): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.errorToastMessage.set(message);
    this.showErrorToast.set(true);
    this.toastTimeout = setTimeout(() => this.dismissToast(), 7000);
  }

  dismissToast(): void {
    this.showErrorToast.set(false);
  }

  // --------------------------------------------------------------------------
  // Modal Orchestration Loop
  // --------------------------------------------------------------------------
  private openSuccessModal(): void {
    this.registeredName.set(this.registerForm.get('firstName')?.value || '');
    this.showSuccessModal.set(true);
    this.countdown.set(5);

    this.countdownInterval = setInterval(() => {
      this.countdown.update((val) => {
        if (val <= 1) {
          clearInterval(this.countdownInterval!);
          this.navigateToLogin();
          return 0;
        }
        return val - 1;
      });
    }, 1000);
  }

  navigateToLogin(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.router.navigate(['/login']);
  }

  dismissModal(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.showSuccessModal.set(false);
    this.submitted.set(false);
  }

  // --------------------------------------------------------------------------
  // Validation Rules
  // --------------------------------------------------------------------------
  gmailValidator(control: AbstractControl): ValidationErrors | null {
    const raw = control.value;
    if (!raw) return null;
    const email = raw.trim().toLowerCase();
    if (!email.endsWith('@gmail.com')) return { invalidGmail: true };
    if (!/^[^\s@]+@gmail\.com$/.test(email)) return { invalidGmail: true };
    const local = email.split('@')[0];
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..'))
      return { invalidGmail: true };
    return null;
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return /^[\u0600-\u06FFa-zA-Z\s'\-.]+$/.test(value) ? null : { invalidName: true };
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (!value) return null;
    const errors: ValidationErrors = {};
    if (value.length < 8) errors['minlength'] = true;
    if (value.length > 128) errors['maxlength'] = true;
    if (!/[A-Z]/.test(value)) errors['missingUppercase'] = true;
    if (!/[a-z]/.test(value)) errors['missingLowercase'] = true;
    if (!/\d/.test(value)) errors['missingDigit'] = true;
    if (!/[!@#$%^&*()\-_+=\[\]{};':"\\|,.<>/?]/.test(value)) errors['missingSpecial'] = true;
    if (value.includes(' ')) errors['hasSpaces'] = true;
    return Object.keys(errors).length ? errors : null;
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const pw = form.get('password')?.value;
    const cp = form.get('confirmPassword')?.value;
    return pw && cp && pw !== cp ? { passwordMismatch: true } : null;
  }

  phoneNumbersNotEqualValidator(form: AbstractControl): ValidationErrors | null {
    const m = form.get('mobile')?.value;
    const p = form.get('parentMobile')?.value;
    return m && p && m === p ? { samePhoneNumbers: true } : null;
  }

  // --------------------------------------------------------------------------
  // Form Mutation Watchers
  // --------------------------------------------------------------------------
  getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (!password) return 'weak';
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()\-_+=\[\]{};':"\\|,.<>/?]/.test(password)) score++;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  onPasswordInput(): void {
    const pw = this.registerForm.get('password')?.value;
    this.passwordStrength.set(pw ? this.getPasswordStrength(pw) : null);
  }

  onEmailInput(): void {
    const ctrl = this.registerForm.get('email');
    if (ctrl?.value) ctrl.updateValueAndValidity();

    if (this.serverErrors().email) {
      const current = ctrl?.value?.trim().toLowerCase() ?? '';
      if (current !== this._lastSubmittedEmail) {
        const { email, ...rest } = this.serverErrors();
        this.serverErrors.set(rest);
      }
    }
  }

  onEmailBlur(): void {
    if (!this.serverErrors().email) return;
    const current = this.registerForm.get('email')?.value?.trim().toLowerCase() ?? '';
    if (current !== this._lastSubmittedEmail) {
      const { email, ...rest } = this.serverErrors();
      this.serverErrors.set(rest);
    }
  }

  onPhoneInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/[^0-9]/g, '');
    this.registerForm.get(controlName)?.setValue(numericValue, { emitEvent: false });

    if (controlName === 'mobile' && this.serverErrors().mobile) {
      if (numericValue !== this._lastSubmittedMobile) {
        const { mobile, ...rest } = this.serverErrors();
        this.serverErrors.set(rest);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Data Submission Action
  // --------------------------------------------------------------------------
  onSubmit(): void {
    this.serverErrors.set({});
    this.dismissToast();

    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach((key) =>
        this.registerForm.get(key)?.markAsTouched(),
      );
      return;
    }

    this.loading.set(true);
    this._lastSubmittedEmail = this.registerForm.get('email')?.value?.trim().toLowerCase() ?? '';
    this._lastSubmittedMobile = this.registerForm.get('mobile')?.value ?? '';
    this.studentToReg = this.registerForm.value;

    this.authService.register(this.studentToReg).subscribe({
      next: () => {
        this.loading.set(true);
        this.authService.sendEmailVerification(this.studentToReg.email).subscribe();
        this.openSuccessModal();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
