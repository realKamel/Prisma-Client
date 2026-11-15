import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { bootstrapEye, bootstrapEyeSlash } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import { firstValueFrom, map } from 'rxjs';
import { MyProfileService } from '../../../../services/my-profile.service';
import {
  differsFromCurrent,
  matchesNewPassword,
  passwordRules,
  passwordStrength,
} from '../password-rules';
import { FormErrorComponent } from '../../../../../../shared/components/forms/form-error.component';

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

@Component({
  selector: 'app-account-page',
  imports: [ReactiveFormsModule, NgIcon, TranslatePipe, NgmMotionDirective, FormErrorComponent],
  templateUrl: './account-page.html',
  viewProviders: [provideIcons({ bootstrapEye, bootstrapEyeSlash })],
})
export class AccountPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MyProfileService);
  private readonly translate = inject(TranslateService);

  protected readonly form = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, passwordRules, differsFromCurrent]],
    confirmPassword: ['', [Validators.required, matchesNewPassword]],
  });

  protected readonly submitting = signal(false);
  protected readonly revealed = signal<ReadonlySet<PasswordField>>(new Set());

  protected readonly strength = toSignal(
    this.form.controls.newPassword.valueChanges.pipe(map((value) => passwordStrength(value))),
    { initialValue: null },
  );
  /** Filled segments of the strength bar. */
  protected readonly strengthLevel = (level: 'weak' | 'medium' | 'strong' | null): number =>
    level === 'strong' ? 3 : level === 'medium' ? 2 : level === 'weak' ? 1 : 0;

  protected readonly fields: readonly {
    name: PasswordField;
    labelKey: string;
    autocomplete: string;
  }[] = [
    { name: 'currentPassword', labelKey: 'TEACHER_PROFILE_PAGE.ACCOUNT.CURRENT', autocomplete: 'current-password' },
    { name: 'newPassword', labelKey: 'TEACHER_PROFILE_PAGE.ACCOUNT.NEW', autocomplete: 'new-password' },
    { name: 'confirmPassword', labelKey: 'TEACHER_PROFILE_PAGE.ACCOUNT.CONFIRM', autocomplete: 'new-password' },
  ];

  constructor() {
    // These two rules compare against another field, so they must re-run when that field changes.
    this.form.controls.newPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
    this.form.controls.currentPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.newPassword.updateValueAndValidity());
  }

  protected toggleReveal(name: PasswordField): void {
    this.revealed.update((current) => {
      const next = new Set(current);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  }

  protected async submit(): Promise<void> {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.submitting.set(true);

    try {
      await firstValueFrom(
        this.api.changePassword({ currentPassword: currentPassword!, newPassword: newPassword! }),
      );
      this.form.reset();
      this.revealed.set(new Set());
      toast.success(this.translate.instant('TEACHER_PROFILE_PAGE.ACCOUNT.SUCCESS'));
    } catch (error) {
      this.handleError(error);
    } finally {
      this.submitting.set(false);
    }
  }

  /** Puts backend messages on their field (a wrong current password gets friendly wording). */
  private handleError(error: unknown): void {
    const problem =
      error instanceof HttpErrorResponse
        ? (error.error as {
            title?: string;
            detail?: string;
            errors?: Record<string, string[]>;
          } | null)
        : null;

    let matched = false;
    for (const [field, messages] of Object.entries(problem?.errors ?? {})) {
      const name = field.charAt(0).toLowerCase() + field.slice(1);
      const control = this.form.get(name);
      if (!control || !messages[0]) continue;

      const key = /current|old/i.test(name)
        ? 'TEACHER_PROFILE_PAGE.ACCOUNT.WRONG_PASSWORD'
        : messages[0];
      control.setErrors({ server: { key } });
      control.markAsTouched();
      matched = true;
    }

    if (!matched) {
      toast.error(
        problem?.detail ??
          problem?.title ??
          this.translate.instant('TEACHER_PROFILE_PAGE.ACCOUNT.FAILED'),
      );
    }
  }
}