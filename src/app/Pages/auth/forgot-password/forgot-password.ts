import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, FormGroup, Validators, 
  AbstractControl, ValidationErrors, 
  ReactiveFormsModule 
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit {
  resetForm: FormGroup;
  submitted = false;
  showNewPassword = false;
  showConfirmPassword = false;
  resetMethod: 'phone' | 'email' = 'phone';
  
  // Step management
  currentStep: 1 | 2 | 3 | 4 = 1;
  otpCode: string[] = ['', '', '', '', '', ''];
  otpDigits: HTMLInputElement[] = [];
  countdownSeconds = 60;
  countdownTimer: any;
  isResendDisabled = true;
  
  // Password strength
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;

  // Store bound validator to avoid rebinding issues
  private boundGmailValidator: (control: AbstractControl) => ValidationErrors | null;

  @ViewChild('otpGroup') otpGroup!: ElementRef;

  constructor(private fb: FormBuilder, private router: Router) {
    this.boundGmailValidator = this.gmailValidator.bind(this);
    
    this.resetForm = this.fb.group({
      mobile: ['', [Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
      email: ['', [this.boundGmailValidator]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    this.updateValidators();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.otpGroup) {
      this.otpDigits = Array.from(this.otpGroup.nativeElement.querySelectorAll('.otp-digit'));
    }
  }

  get f() { return this.resetForm.controls; }

  // Toggle between phone/email reset method
  setResetMethod(method: 'phone' | 'email'): void {
    this.resetMethod = method;
    this.updateValidators();
    
    if (method === 'phone') {
      this.resetForm.get('email')?.setValue('');
      this.resetForm.get('email')?.clearValidators();
      this.resetForm.get('email')?.setErrors(null);
      this.resetForm.get('email')?.updateValueAndValidity({ emitEvent: true });
    } else {
      this.resetForm.get('mobile')?.setValue('');
      this.resetForm.get('mobile')?.clearValidators();
      this.resetForm.get('mobile')?.setErrors(null);
      this.resetForm.get('mobile')?.updateValueAndValidity({ emitEvent: true });
    }
    this.resetForm.updateValueAndValidity({ emitEvent: true });
  }

  // Update validators based on selected method
  updateValidators(): void {
    if (this.resetMethod === 'phone') {
      this.resetForm.get('mobile')?.setValidators([
        Validators.required, 
        Validators.pattern(/^(010|011|012|015)\d{8}$/)
      ]);
      this.resetForm.get('email')?.clearValidators();
      this.resetForm.get('email')?.setErrors(null);
    } else {
      this.resetForm.get('email')?.setValidators([
        Validators.required, 
        this.boundGmailValidator
      ]);
      this.resetForm.get('mobile')?.clearValidators();
      this.resetForm.get('mobile')?.setErrors(null);
    }
    this.resetForm.get('mobile')?.updateValueAndValidity({ emitEvent: true });
    this.resetForm.get('email')?.updateValueAndValidity({ emitEvent: true });
    this.resetForm.updateValueAndValidity({ emitEvent: true });
  }

  // Gmail-only validator
  gmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value?.trim().toLowerCase();
    if (!email || !email.endsWith('@gmail.com')) return { invalidGmail: true };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { invalidGmail: true };
    return null;
  }

  // Password strength validator
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value) || /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score >= 3 ? null : { weakPassword: true };
  }

  // Password match validator
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Calculate password strength for UI
  getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (!password) return 'weak';
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) || /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  onPasswordInput(): void {
    const password = this.resetForm.get('newPassword')?.value;
    this.passwordStrength = password ? this.getPasswordStrength(password) : null;
  }

  // Allow only digits in phone input
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/[^0-9]/g, '');
    this.resetForm.get('mobile')?.setValue(numericValue, { emitEvent: false });
  }

  // Trigger email re-validation
  onEmailInput(): void {
    const emailControl = this.resetForm.get('email');
    if (emailControl?.value) emailControl.updateValueAndValidity({ emitEvent: true });
  }

  // Step 1: Send OTP
  onSendOtp(): void {
    this.submitted = true;
    
    if (this.resetMethod === 'phone') {
      this.resetForm.get('mobile')?.markAsTouched();
      if (this.resetForm.get('mobile')?.invalid) return;
    } else {
      this.resetForm.get('email')?.markAsTouched();
      if (this.resetForm.get('email')?.invalid) return;
    }
    
    const btn = document.getElementById('send-btn') as HTMLButtonElement;
    if (btn) {
      btn.classList.add('loading');
      btn.disabled = true;
    }
    
    setTimeout(() => {
      if (btn) {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
      this.currentStep = 2;
      this.startCountdown();
      setTimeout(() => this.otpDigits[0]?.focus(), 100);
    }, 1200);
  }

  // OTP Input Handling
  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
    this.otpCode[index] = value;
    input.value = value;
    
    if (value && index < 5) {
      this.otpDigits[index + 1]?.focus();
    }
    
    this.clearOtpError();
  }

  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpCode[index] && index > 0) {
      event.preventDefault();
      this.otpCode[index - 1] = '';
      this.otpDigits[index - 1]?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '').replace(/[^0-9]/g, '').slice(0, 6);
    
    pasted.split('').forEach((char, idx) => {
      if (idx < 6) {
        this.otpCode[idx] = char;
        this.otpDigits[idx].value = char;
      }
    });
    
    const nextEmpty = this.otpDigits.findIndex((d, i) => !this.otpCode[i]);
    (nextEmpty >= 0 ? this.otpDigits[nextEmpty] : this.otpDigits[5])?.focus();
    this.clearOtpError();
  }

  getOtpValue(): string {
    return this.otpCode.join('');
  }

  clearOtpError(): void {
    const errEl = document.getElementById('otp-err');
    if (errEl) errEl.classList.remove('show');
    this.otpDigits.forEach(d => d.classList.remove('otp-error'));
  }

  showOtpError(): void {
    const errEl = document.getElementById('otp-err');
    if (errEl) errEl.classList.add('show');
    this.otpDigits.forEach(d => d.classList.add('otp-error'));
    
    const group = this.otpGroup?.nativeElement;
    if (group) {
      group.classList.add('shake');
      setTimeout(() => group.classList.remove('shake'), 400);
    }
    this.otpDigits[0]?.focus();
  }

  // Step 2: Verify OTP
  onVerifyOtp(): void {
    const code = this.getOtpValue();
    
    if (code.length < 6) {
      this.showOtpError();
      return;
    }
    
    const btn = document.getElementById('verify-btn') as HTMLButtonElement;
    if (btn) {
      btn.classList.add('loading');
      btn.disabled = true;
    }
    
    setTimeout(() => {
      if (btn) {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
      this.otpDigits.forEach(d => {
        d.classList.remove('otp-error');
        d.classList.add('otp-success');
      });
      
      setTimeout(() => {
        this.currentStep = 3;
      }, 400);
    }, 1200);
  }

  // Resend OTP with countdown
  startCountdown(): void {
    this.isResendDisabled = true;
    this.countdownSeconds = 60;
    
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    
    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownTimer);
        this.isResendDisabled = false;
      }
    }, 1000);
  }

  onResendOtp(): void {
    if (this.isResendDisabled) return;
    
    this.otpCode = ['', '', '', '', '', ''];
    this.otpDigits.forEach(d => {
      d.value = '';
      d.classList.remove('filled', 'otp-success', 'otp-error');
    });
    
    this.clearOtpError();
    this.startCountdown();
    this.otpDigits[0]?.focus();
  }

  getFormattedCountdown(): string {
    const m = Math.floor(this.countdownSeconds / 60);
    const s = this.countdownSeconds % 60;
    return `(${m}:${String(s).padStart(2, '0')})`;
  }

  // ✅ FIX: Step 3 — only validate password fields, not the whole form
  onSavePassword(): void {
    this.submitted = true;
    
    this.resetForm.get('newPassword')?.markAsTouched();
    this.resetForm.get('confirmPassword')?.markAsTouched();
    
    // Only check password-related fields, not mobile/email
    const passwordInvalid =
      this.resetForm.get('newPassword')?.invalid ||
      this.resetForm.get('confirmPassword')?.invalid ||
      !!this.resetForm.errors?.['passwordMismatch'];

    if (passwordInvalid) return;
    
    // ✅ FIX: Correct button id is 'save-btn'
    const btn = document.getElementById('save-btn') as HTMLButtonElement;
    if (btn) {
      btn.classList.add('loading');
      btn.disabled = true;
    }
    
    setTimeout(() => {
      if (btn) {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
      this.currentStep = 4;
    }, 1400);
  }

  // Go back to previous step
  goToStep(step: 1 | 2 | 3): void {
    this.currentStep = step;
    if (step === 1) {
      this.resetForm.reset();
      this.otpCode = ['', '', '', '', '', ''];
      this.passwordStrength = null;
    }
  }

  // Navigate to login after success
  onGoToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Get identifier for display (masked)
  getDisplayIdentifier(): string {
    const value = this.resetMethod === 'phone' 
      ? this.resetForm.get('mobile')?.value 
      : this.resetForm.get('email')?.value;
    
    if (!value) return '—';
    
    if (this.resetMethod === 'phone') {
      return value.slice(0, 3) + '****' + value.slice(-4);
    } else {
      const [local, domain] = value.split('@');
      return local.slice(0, 2) + '****@' + domain;
    }
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
}