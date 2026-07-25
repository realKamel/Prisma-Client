import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RegexPatterns } from './regex-patterns';

export class AppValidators {
  static egyptianPhoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const isValid = RegexPatterns.egyptianPhone.test(control.value);
      return isValid ? null : { strongPassword: { valid: false } };
    };
  }
  static nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return RegexPatterns.personName.test(value) ? null : { invalidName: true };
  }
  static gmailValidator(control: AbstractControl): ValidationErrors | null {
    const raw = control.value;
    if (!raw) return null;
    const email = raw.trim().toLowerCase();
    if (!email.endsWith('@gmail.com')) return { invalidGmail: true };
    if (!/^[^\s@]+@gmail\.com$/.test(email)) return { invalidGmail: true };
    const local = email.split('@')[0];
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..'))
      return { invalidGmail: true };
    return null;
  }

  static passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    if (!value) return null;
    const errors: ValidationErrors = {};
    if (value.length < 8) errors['minlength'] = true;
    if (value.length > 128) errors['maxlength'] = true;
    if (!/[A-Z]/.test(value)) errors['missingUppercase'] = true;
    if (!/[a-z]/.test(value)) errors['missingLowercase'] = true;
    if (!/\d/.test(value)) errors['missingDigit'] = true;
    if (!/[!@#$%^&*()\-_+=[\]{};'":"\\|,.<>/?]/.test(value)) errors['missingSpecial'] = true;
    if (value.includes(' ')) errors['hasSpaces'] = true;
    return Object.keys(errors).length ? errors : null;
  }

  static optionalPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value?.trim()) return null;
    return AppValidators.passwordValidator(control);
  }

  static passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const pw = form.get('password')?.value;
    const cpw = form.get('confirmPassword')?.value;
    if (!pw && !cpw) return null;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  }

  static phoneNumbersNotEqualValidator(form: AbstractControl): ValidationErrors | null {
    const m = form.get('mobile')?.value;
    const p = form.get('parentMobile')?.value;
    return m && p && m === p ? { samePhoneNumbers: true } : null;
  }
}
