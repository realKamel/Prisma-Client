import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ISendNewPassword } from '../../../../core/Models/Forgot-Password';
import { AuthService } from '../../../../core/Services/auth';
import { ForgotPasswordComponent } from '../forgot-password';

type Strength = '' | 'weak' | 'medium' | 'strong';

@Component({
  selector: 'app-step-new-password',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './step-new-password.html',
  styleUrls: ['./step-new-password.css'],
})
export class StepNewPasswordComponent {
  public readonly saved = output<void>();
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly loading = signal(false);
  protected readonly showNew = signal(false);
  protected readonly showConfirm = signal(false);
  protected readonly newError = signal('');
  protected readonly confirmError = signal('');
  private readonly translate = inject(TranslateService);

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
    const s = this.strength();
    if (!s) return '';
    return String(this.translate.translate(`VALIDATION.PASSWORD_STRENGTH.${s.toUpperCase()}`)());
  });

  protected onNewPasswordBlur() {
    if (this.newPassword().length < 8) {
      this.newError.set(this.translate.instant('VALIDATION.PASSWORD_MIN_LENGTH'));
    } else {
      this.newError.set('');
    }
  }

  protected onConfirmBlur() {
    const confirm = this.confirmPassword();
    if (!confirm) {
      this.confirmError.set('');
      return;
    }
    this.confirmError.set(
      confirm !== this.newPassword() ? this.translate.instant('VALIDATION.PASSWORDS_MISMATCH') : '',
    );
  }

  protected readonly strengthColor = computed(() => {
    const s = this.strength();
    if (s === 'weak') return 'var(--color-coral)';
    if (s === 'medium') return 'var(--color-star)';
    return 'var(--color-mint)';
  });

  protected readonly strengthWidth = computed(() => {
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
  protected sendNewPassword: ISendNewPassword = {} as ISendNewPassword;
  protected onSubmit() {
    let ok = true;

    // Validate New Password
    if (this.newPassword().length < 8) {
      this.newError.set(this.translate.instant('VALIDATION.PASSWORD_MIN_LENGTH'));
      ok = false;
    } else {
      this.newError.set('');
    }

    // Validate Confirm Password
    const confirm = this.confirmPassword();
    if (!confirm) {
      this.confirmError.set(this.translate.instant('VALIDATION.CONFIRM_PASSWORD_REQUIRED'));
      ok = false;
    } else if (confirm !== this.newPassword()) {
      this.confirmError.set(this.translate.instant('VALIDATION.PASSWORDS_MISMATCH'));
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
