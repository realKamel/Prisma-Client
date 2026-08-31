import { Component, computed, inject, input, model, output, signal } from '@angular/core';

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
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly loading = signal(false);
  protected readonly showNew = signal(false);
  protected readonly showConfirm = signal(false);
  protected readonly newError = signal('');
  protected readonly confirmError = signal('');

  protected readonly strength = computed<Strength>(() => {
    const pw = this.newPassword();
    if (!pw) return '';

    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Za-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    return score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong';
  });

  protected readonly strengthLabel = computed(() => {
    const labels: Record<Strength, string> = {
      '': '',
      weak: 'ضعيفة — زوّدها بأرقام وحروف',
      medium: 'متوسطة — تمام، ممكن تحسّنها',
      strong: 'قوية ✓',
    };
    return labels[this.strength()];
  });

  onNewPasswordBlur() {
    if (this.newPassword().length < 8) {
      this.newError.set('كلمة المرور لازم تكون 8 حروف على الأقل');
    } else {
      this.newError.set('');
    }
  }

  onConfirmBlur() {
    const confirm = this.confirmPassword();
    if (!confirm) {
      this.confirmError.set('');
      return;
    }
    this.confirmError.set(confirm !== this.newPassword() ? 'كلمتا المرور مش متطابقتين' : '');
  }

  protected readonly strengthColor = computed(() => {
    const s = this.strength();
    if (s === 'weak') return 'var(--color-coral)';
    if (s === 'medium') return 'var(--color-star)';
    return 'var(--color-mint)';
  });

  readonly strengthWidth = computed(() => {
    const s = this.strength();
    if (s === 'weak') return '33%';
    if (s === 'medium') return '66%';
    return '100%';
  });

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
    if (this.newPassword().length < 8) {
      this.newError.set('كلمة المرور لازم تكون 8 حروف على الأقل');
      ok = false;
    } else {
      this.newError.set('');
    }

    // Validate Confirm Password
    const confirm = this.confirmPassword();
    if (!confirm) {
      this.confirmError.set('تأكيد كلمة المرور مطلوب');
      ok = false;
    } else if (confirm !== this.newPassword()) {
      this.confirmError.set('كلمتا المرور مش متطابقتين');
      ok = false;
    } else {
      this.confirmError.set('');
    }

    if (!ok) return;

    this.loading.set(true);

    const payload: ISendNewPassword = {
      Email: this.forget.contactValue(),
      NewPassword: this.newPassword(),
    };

    this.authService.sendPassword(payload).subscribe({
      next: () => {
        this.saved.emit();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
