import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserLogin } from '../../../core/Models/UserLogin';
import { AuthService } from '../../../core/Services/auth';
import { Navbar } from '../../../Components/navbar/navbar';

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
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);


  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      // Both fields exist, but only one is required based on toggle
      mobile: [null, [Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
      email: [null, [this.gmailValidator.bind(this)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Set initial validation based on default method
    this.updateValidators();
  }
  user: UserLogin = {} as UserLogin;

  ngOnInit(): void { }

  get f() { return this.loginForm.controls; }

  // Toggle between phone/email login
  setLoginMethod(method: 'phone' | 'email'): void {
    this.loginMethod = method;
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
u:any;
onSubmit(): void {
    this.submitted = true;
    
    
      this.loginForm.get('mobile')?.markAsTouched();
    
      this.loginForm.get('email')?.markAsTouched();
    
    this.loginForm.get('password')?.markAsTouched();
    
    if (this.loginForm.invalid) return;
    
    const loginData = {
      email: this.loginForm.get('email')?.value,
      mobile: this.loginForm.get('mobile')?.value,
      password: this.loginForm.get('password')?.value
    };
    this.user = loginData;
    // Show loading state
    const btn = document.getElementById('submit-btn') as HTMLButtonElement;
    if (btn) {
      btn.classList.add('loading');
      btn.disabled = true;
    }
    this.authService.loginEmail(this.user).subscribe({
      next: (res) => {this.u=res;
        console.log(res);
        this.submitted = true;
        this.cdr.detectChanges();
        alert(' Login successful! Redirecting to home...');
        this.authService.login({
          id: this.u.id,
          name: this.u.firstName + ' ' + this.u.lastName,
          email: this.u.email,
          role: 'student',
        });
        // Navigate to HOME PAGE after successful login
        this.router.navigate(['/home']);  // HOME PAGE
      },
      error:(err)=>{
        console.error(err)
      }
    });
    
  }
}
