import { Component, inject, output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/Services/auth';
import { ISendNewPassword } from '../../../../core/Models/Forgot-Password';
import { email } from '@angular/forms/signals';
import { ForgotPasswordComponent } from '../forgot-password';

type Strength = '' | 'weak' | 'medium' | 'strong';

@Component({
  selector: 'app-step-new-password',

  imports: [FormsModule],
  templateUrl: './step-new-password.html',
  styleUrls: ['./step-new-password.css'],
})
export class StepNewPasswordComponent {
  readonly saved = output<void>();

  newPassword = '';
  confirmPassword = '';
  loading = false;
  showNew = false;
  showConfirm = false;
  newError = '';
  confirmError = '';
  strength: Strength = '';
  strengthLabel = '';

  onNewPasswordInput() {
    this.newError = '';
    if (!this.newPassword) {
      this.strength = '';
      this.strengthLabel = '';
      return;
    }
    this.strength = this.calcStrength(this.newPassword);
    const labels: Record<Strength, string> = {
      '': '',
      weak: 'ضعيفة — زوّدها بأرقام وحروف',
      medium: 'متوسطة — تمام، ممكن تحسّنها',
      strong: 'قوية ✓',
    };
    this.strengthLabel = labels[this.strength];

    // ✅ Re-validate confirm password if it's already filled
    if (this.confirmPassword) {
      this.onConfirmBlur();
    }
  }

  onNewPasswordBlur() {
    if (this.newPassword.length < 8) {
      this.newError = 'كلمة المرور لازم تكون 8 حروف على الأقل';
    } else {
      this.newError = ''; // Clear error if valid
    }
  }

  onConfirmBlur() {
    if (!this.confirmPassword) {
      this.confirmError = '';
      return;
    }
    this.confirmError =
      this.confirmPassword !== this.newPassword ? 'كلمتا المرور مش متطابقتين' : '';
  }

  strengthColor(): string {
    return this.strength === 'weak'
      ? 'var(--coral)'
      : this.strength === 'medium'
        ? 'var(--star)'
        : 'var(--mint)';
  }

  strengthWidth(): string {
    return this.strength === 'weak' ? '33%' : this.strength === 'medium' ? '66%' : '100%';
  }

  private calcStrength(pw: string): Strength {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Za-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong';
  }
  private authService = inject(AuthService);
  private forget = inject(ForgotPasswordComponent);
  sendNewPassword: ISendNewPassword = {} as ISendNewPassword;
  onSubmit() {
    let ok = true;

    // Validate New Password
    if (this.newPassword.length < 8) {
      this.newError = 'كلمة المرور لازم تكون 8 حروف على الأقل';
      ok = false;
    } else {
      this.newError = '';
    }

    // ✅ Validate Confirm Password (including empty check)
    if (!this.confirmPassword) {
      this.confirmError = 'تأكيد كلمة المرور مطلوب';
      ok = false;
    } else if (this.confirmPassword !== this.newPassword) {
      this.confirmError = 'كلمتا المرور مش متطابقتين';
      ok = false;
    } else {
      this.confirmError = '';
    }

    if (!ok) return;

    this.loading = true;
    this.sendNewPassword = {
      Email: this.forget.contactValue,
      NewPassword: this.newPassword,
    };
    this.authService.sendPassword(this.sendNewPassword).subscribe({
      next: () => {
        this.saved.emit();
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
