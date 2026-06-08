import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

type ContactMethod = 'phone' | 'email';

@Component({
  selector: 'app-step-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './step-contact.html',
  styleUrls: ['./step-contact.css'],
})
export class StepContactComponent {
  @Output() submitted = new EventEmitter<string>();

  method: ContactMethod = 'phone';
  value = '';
  loading = false;
  fieldError = '';

  switchMethod(m: ContactMethod) {
    this.method = m;
    this.value = '';
    this.fieldError = '';
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
    const val = this.value.trim();
    
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
      this.fieldError = 'البريد الإلكتروني يجب أن ينتهي بـ @gmail.com';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.fieldError = 'اكتب بريد إلكتروني صحيح';
      return false;
    }

    // ✅ HASHED: Closing bracket for phone method
    /*
    }
    */
    
    this.fieldError = '';
    return true;
  }

  onSubmit() {
    if (this.method === 'phone') return; // Prevent submission if phone is selected
    if (!this.validate()) return;
    this.loading = true;
    
    // Replace with: this.forgotPasswordService.sendOtp(this.value).subscribe(...)
    setTimeout(() => {
      this.loading = false;
      this.submitted.emit(this.value);
    }, 1200);
  }
}