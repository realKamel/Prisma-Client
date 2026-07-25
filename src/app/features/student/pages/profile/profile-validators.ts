import { PasswordStrength } from '../../../../core/Models/Student/student-profile.model';

export function isEgyptianMobile(value: string): boolean {
  return /^(010|011|012|015)\d{8}$/.test(value.trim());
}

export function isFullName(value: string): boolean {
  return value.trim().split(/\s+/).length >= 2;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Za-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}
