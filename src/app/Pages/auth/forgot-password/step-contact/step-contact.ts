import { Component, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/Services/auth';
import { ISendEmail } from '../../../../core/Models/Forgot-Password';

type ContactMethod = 'phone' | 'email';

@Component({
  selector: 'app-step-contact',
  imports: [FormsModule, RouterModule],
  templateUrl: './step-contact.html',
  styleUrls: ['./step-contact.css'],
})
export class StepContactComponent {
  readonly submitted = output<string>();
  protected readonly method = signal<ContactMethod>('phone');
  protected readonly value = signal('');
  protected readonly loading = signal(false);
  protected readonly fieldError = signal('');

  switchMethod(m: ContactMethod) {
    this.method.set(m);
    this.value.set('');
    this.fieldError.set('');
  }

  onBlur() {
    this.validate();
  }

  // ✅ HASHED: Strictly allow only digits in phone input (Off-work for now)
  onPhoneInput(event: Event): void {
    /*
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/[^0-9]/g, '');

    // Update the DOM element directly to ensure non-numeric chars are removed immediately
    if (input.value !== numericValue) {
      input.value = numericValue;
    }
    this.value = numericValue;
    */
  }

  validate(): boolean {
    const val = this.value().trim();

    // ✅ HASHED: Phone validation is currently off-work
    /*
    if (this.method === 'phone') {
      if (!/^(010|011|012|015)\d{8}$/.test(val)) {
        this.fieldError = 'اكتب رقم موبايل مصري صحيح (11 رقم يبدأ بـ 01)';
        return false;
      }
    } else {
    */

    const email = val.toLowerCase();
    if (!email || !email.endsWith('@gmail.com')) {
      this.fieldError.set('البريد الإلكتروني يجب أن ينتهي بـ @gmail.com');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.fieldError.set('اكتب بريد إلكتروني صحيح');
      return false;
    }

    // ✅ HASHED: Closing bracket for phone method
    /*
    }
    */

    this.fieldError.set('');
    return true;
  }
  private authService = inject(AuthService);
  emailSend: ISendEmail = {} as ISendEmail;
  onSubmit() {
    if (this.method() === 'phone') return;
    if (!this.validate()) return;
    this.loading.set(true);
    this.emailSend.Email = this.value();
    this.authService.sendOtp(this.emailSend).subscribe({
      next: () => {
        this.submitted.emit(this.value());
      },
    });
  }
}
