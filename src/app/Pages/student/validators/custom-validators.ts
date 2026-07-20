import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /** Matches: 010/011/012/015 + 8 digits */
  static egyptianMobile(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').toString().trim();
      if (!value) return null; // let Validators.required handle empty
      return /^(010|011|012|015)\d{8}$/.test(value) ? null : { egyptianMobile: true };
    };
  }

  /** Requires at least two words (first + last name) */
  static fullName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').toString().trim();
      if (!value) return null;
      return value.split(/\s+/).length >= 2 ? null : { fullName: true };
    };
  }

  /** Cross-field validator: confirm password must equal new password */
  static passwordsMatch(newPasswordKey: string, confirmKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get(newPasswordKey)?.value ?? '';
      const confirm = group.get(confirmKey)?.value ?? '';
      if (!confirm) return null;
      return newPassword === confirm ? null : { passwordsMismatch: true };
    };
  }
}
