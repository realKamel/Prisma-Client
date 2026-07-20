import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { PasswordStrength } from '../../../../../core/Models/Student/student-profile.model';
import { ProfileService } from '../../../../../core/Services/profile.service';
import { getPasswordStrength } from '../../profile-validators';
import { toast } from 'ngx-sonner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowRepeat,
  bootstrapExclamationTriangle,
  bootstrapEye,
  bootstrapEyeSlash,
  bootstrapLock,
  bootstrapShieldLock,
} from '@ng-icons/bootstrap-icons';

interface PasswordFormState {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

const EMPTY_STATE: PasswordFormState = { current: false, new: false, confirm: false };

@Component({
  selector: 'app-change-password-card',
  imports: [FormsModule, NgIcon],
  templateUrl: './change-password-card.component.html',
  viewProviders: [
    provideIcons({
      bootstrapShieldLock,
      bootstrapLock,
      bootstrapEye,
      bootstrapEyeSlash,
      bootstrapExclamationTriangle,
      bootstrapArrowRepeat,
    }),
  ],
})
export class ChangePasswordCardComponent {
  private readonly profileService = inject(ProfileService);

  protected currentPassword = '';
  protected newPassword = '';
  protected confirmPassword = '';

  protected readonly showCurrent = signal(false);
  protected readonly showNew = signal(false);
  protected readonly showConfirm = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errors = signal<PasswordFormState>({ ...EMPTY_STATE });
  protected readonly touched = signal<PasswordFormState>({ ...EMPTY_STATE });

  protected get strength(): PasswordStrength | null {
    return this.newPassword ? getPasswordStrength(this.newPassword) : null;
  }

  protected get strengthLabel(): string {
    switch (this.strength) {
      case 'weak':
        return 'ضعيفة — زوّدها بأرقام وحروف';
      case 'medium':
        return 'متوسطة — تمام، ممكن تحسّنها';
      case 'strong':
        return 'قوية';
      default:
        return '—';
    }
  }

  protected toggleVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrent.update((v) => !v);
    if (field === 'new') this.showNew.update((v) => !v);
    if (field === 'confirm') this.showConfirm.update((v) => !v);
  }

  protected validateField(field: keyof PasswordFormState): void {
    this.touched.update((state) => ({ ...state, [field]: true }));
    this.errors.update((state) => ({ ...state, [field]: !this.isFieldValid(field) }));
  }

  private isFieldValid(field: keyof PasswordFormState): boolean {
    switch (field) {
      case 'current':
        return !!this.currentPassword;
      case 'new':
        return this.newPassword.length >= 8;
      case 'confirm':
        return !!this.confirmPassword && this.confirmPassword === this.newPassword;
    }
  }

  protected submit(): void {
    const fields: (keyof PasswordFormState)[] = ['current', 'new', 'confirm'];
    const nextErrors = { ...EMPTY_STATE };
    fields.forEach((field) => {
      nextErrors[field] = !this.isFieldValid(field);
    });
    this.errors.set(nextErrors);
    this.touched.set({ current: true, new: true, confirm: true });

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    this.isSubmitting.set(true);
    this.profileService
      .changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword })
      .subscribe(() => {
        this.isSubmitting.set(false);
        this.resetForm();
        toast.success('تم تغيير كلمة المرور بنجاح');
      });
  }

  private resetForm(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showCurrent.set(false);
    this.showNew.set(false);
    this.showConfirm.set(false);
    this.errors.set({ ...EMPTY_STATE });
    this.touched.set({ ...EMPTY_STATE });
  }
}
