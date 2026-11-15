import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface FormErrorMessage {
  /** i18n key (or, for server errors, the raw message: ngx-translate returns unknown keys as-is). */
  key: string;
  params?: Record<string, unknown>;
}

const DEFAULT_KEYS: Record<string, string> = {
  required: 'VALIDATION.REQUIRED',
  minlength: 'VALIDATION.MIN_LENGTH',
  maxlength: 'VALIDATION.MAX_LENGTH',
  min: 'VALIDATION.MIN_VALUE',
  max: 'VALIDATION.MAX_VALUE',
  pattern: 'VALIDATION.INVALID_FORMAT',
  email: 'VALIDATION.EMAIL_INVALID',
};

/**
 * Message for the control's first error, once it is touched or dirty.
 *
 * Resolution order for the i18n key:
 *  1. `overrides[code]`: per-field wording for a built-in error code
 *  2. `{ code: { key: 'VALIDATION.X' } }`: custom validators carry their own key
 *  3. the default key for the built-in code
 */
export function formError(
  control: AbstractControl | null,
  overrides?: Record<string, string>,
): FormErrorMessage | null {
  if (!control?.errors || !(control.touched || control.dirty)) return null;

  const [code, detail] = Object.entries(control.errors)[0] as [string, unknown];
  const params =
    typeof detail === 'object' && detail !== null ? (detail as Record<string, unknown>) : undefined;

  const key =
    overrides?.[code] ?? (params?.['key'] as string | undefined) ?? DEFAULT_KEYS[code] ?? 'VALIDATION.INVALID';

  return { key, params };
}

/** Like Validators.required, but whitespace-only text also counts as empty. */
export const requiredText: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim().length > 0 ? null : { required: true };