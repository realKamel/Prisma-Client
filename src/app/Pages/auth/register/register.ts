import { Component, inject, OnInit } from '@angular/core';
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
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  loading = false; // Added to handle the spinner state independently from the success overlay
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;
  studentToReg:StudentRegister = {

  }as StudentRegister
  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      secondName: ['', [Validators.required, Validators.minLength(2)]],
      thirdName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      mobile: ['', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]],

      // UPDATED: Use custom gmailValidator instead of Validators.email
      email: ['', [Validators.required, this.gmailValidator.bind(this)]],

      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      grade: ['', Validators.required],
      parentMobile: ['', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]]
      
    }, { 
      // UPDATED: Added the new validator to the array of group validators
      validators: [this.passwordMatchValidator, this.phoneNumbersNotEqualValidator] 
    });
  }
  private authService = inject(AuthService);
  ngOnInit(): void { }
  get f() { return this.registerForm.controls; }

  // NEW: Custom validator for @gmail.com only
  gmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value?.trim().toLowerCase();

    // Check if email ends with @gmail.com
    if (!email || !email.endsWith('@gmail.com')) {
      return { invalidGmail: true };
    }

    // Basic email format validation (optional but recommended)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { invalidGmail: true };
    }

    return null;
  }

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

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // NEW: Validator to ensure mobile and parentMobile are not the same
  phoneNumbersNotEqualValidator(form: AbstractControl): ValidationErrors | null {
    const mobile = form.get('mobile')?.value;
    const parentMobile = form.get('parentMobile')?.value;
    
    // Only validate if both fields have values
    if (mobile && parentMobile && mobile === parentMobile) {
      return { samePhoneNumbers: true };
    }
    return null;
  }

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
    const password = this.registerForm.get('password')?.value;
    this.passwordStrength = password ? this.getPasswordStrength(password) : null;
  }

  // NEW: Trigger re-validation on email input for real-time feedback
  onEmailInput(): void {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.value) {
      emailControl.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      // Debug: log errors to console
      console.log('❌ Form Errors:', this.registerForm.errors);
      console.log('❌ Email Errors:', this.registerForm.get('email')?.errors);

      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    // Start loading state to show the spinner immediately
    this.loading = true;
    this.studentToReg = this.registerForm.value;
    
    this.authService.register(this.studentToReg).subscribe({
      next: () => {
        this.loading = false; // Stop spinner
        this.submitted = true; // Trigger success overlay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      },
      error: (err) => {
        this.loading = false; // Stop spinner if an error occurs
        console.error(err);
      }
    });
  }

  // Allow only digits (0-9) in phone inputs
  onPhoneInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    // Remove all non-digit characters
    const numericValue = input.value.replace(/[^0-9]/g, '');
    // Update the form control value
    this.registerForm.get(controlName)?.setValue(numericValue, { emitEvent: false });
  }

  getFullName(): string {
    const f = this.registerForm.value;
    return [f.firstName, f.secondName, f.thirdName, f.lastName].filter(Boolean).join(' ');
  }
}