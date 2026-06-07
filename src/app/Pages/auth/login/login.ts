import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  loginMethod: 'phone' | 'email' = 'phone'; // Toggle state

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      // Both fields exist, but only one is required based on toggle
      mobile: ['', [Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
      email: ['', [this.gmailValidator.bind(this)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Set initial validation based on default method
    this.updateValidators();
  }

  ngOnInit(): void { }

  get f() { return this.loginForm.controls; }

  // Toggle between phone/email login
  setLoginMethod(method: 'phone' | 'email'): void {
    this.loginMethod = method;
    this.updateValidators();
    // Clear the other field when switching
    if (method === 'phone') {
      this.loginForm.get('email')?.setValue('');
      this.loginForm.get('email')?.clearValidators();
      this.loginForm.get('email')?.updateValueAndValidity();
    } else {
      this.loginForm.get('mobile')?.setValue('');
      this.loginForm.get('mobile')?.clearValidators();
      this.loginForm.get('mobile')?.updateValueAndValidity();
    }
  }

  // Update validators based on selected method
  updateValidators(): void {
    if (this.loginMethod === 'phone') {
      this.loginForm.get('mobile')?.setValidators([
        Validators.required,
        Validators.pattern(/^(010|011|012|015)\d{8}$/)
      ]);
      this.loginForm.get('email')?.clearValidators();
    } else {
      this.loginForm.get('email')?.setValidators([
        Validators.required,
        this.gmailValidator.bind(this)
      ]);
      this.loginForm.get('mobile')?.clearValidators();
    }
    this.loginForm.get('mobile')?.updateValueAndValidity();
    this.loginForm.get('email')?.updateValueAndValidity();
  }

  // Gmail-only validator
  gmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value?.trim().toLowerCase();
    if (!email || !email.endsWith('@gmail.com')) {
      return { invalidGmail: true };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { invalidGmail: true };
    }
    return null;
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
    this.submitted = true;
    
    if (this.loginMethod === 'phone') {
      this.loginForm.get('mobile')?.markAsTouched();
    } else {
      this.loginForm.get('email')?.markAsTouched();
    }
    this.loginForm.get('password')?.markAsTouched();
    
    if (this.loginForm.invalid) return;
    
    const loginData = {
      method: this.loginMethod,
      identifier: this.loginMethod === 'phone' 
        ? this.loginForm.get('mobile')?.value 
        : this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };
    
    console.log('Login Data:', loginData);
    
    // Show loading state
    const btn = document.getElementById('submit-btn') as HTMLButtonElement;
    if (btn) {
      btn.classList.add('loading');
      btn.disabled = true;
    }
    
    // Navigate to HOME PAGE after successful login
    setTimeout(() => {
      console.log(' Login successful! Redirecting to home...');
      this.router.navigate(['/']);  // HOME PAGE
    }, 1500);
  }
}
