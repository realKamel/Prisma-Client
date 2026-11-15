import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

interface PasswordRule {
  code: string;
  key: string;
  passes: (value: string) => boolean;
}

/** Same wording keys as the register form (VALIDATION.PASSWORD_*), checked in this order. */
const RULES: readonly PasswordRule[] = [
  { code: 'passwordMin', key: 'VALIDATION.PASSWORD_MIN_LENGTH', passes: (v) => v.length >= 8 },
  { code: 'passwordMax', key: 'VALIDATION.PASSWORD_MAX_LENGTH', passes: (v) => v.length <= 128 },
  { code: 'passwordSpaces', key: 'VALIDATION.PASSWORD_NO_SPACES', passes: (v) => !/\s/.test(v) },
  { code: 'passwordUpper', key: 'VALIDATION.PASSWORD_UPPERCASE', passes: (v) => /[A-Z]/.test(v) },
  { code: 'passwordLower', key: 'VALIDATION.PASSWORD_LOWERCASE', passes: (v) => /[a-z]/.test(v) },
  { code: 'passwordDigit', key: 'VALIDATION.PASSWORD_DIGIT', passes: (v) => /\d/.test(v) },
  { code: 'passwordSpecial', key: 'VALIDATION.PASSWORD_SPECIAL', passes: (v) => /[^A-Za-z0-9\s]/.test(v) },
];

/** Reports the first rule the password breaks; empty values are left to `required`. */
export const passwordRules: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null;

  const broken = RULES.find((rule) => !rule.passes(value));
  return broken ? { [broken.code]: { key: broken.key } } : null;
};

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export function passwordStrength(value: string | null | undefined): PasswordStrength | null {
  const v = value ?? '';
  if (!v) return null;

  const score =
    [v.length >= 8, /[A-Z]/.test(v), /[a-z]/.test(v), /\d/.test(v), /[^A-Za-z0-9\s]/.test(v)].filter(Boolean)
      .length + (v.length >= 12 ? 1 : 0);

  return score <= 3 ? 'weak' : score <= 5 ? 'medium' : 'strong';
}

/** Error on the confirm field while it differs from the new password. */
export const matchesNewPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value === control.parent?.get('newPassword')?.value
    ? null
    : { mismatch: { key: 'VALIDATION.PASSWORDS_MISMATCH' } };

/** Error on the new password while it equals the current one. */
export const differsFromCurrent: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const current = control.parent?.get('currentPassword')?.value;
  return current && control.value === current
    ? { sameAsCurrent: { key: 'TEACHER_PROFILE_PAGE.ACCOUNT.SAME_AS_OLD' } }
    : null;
};