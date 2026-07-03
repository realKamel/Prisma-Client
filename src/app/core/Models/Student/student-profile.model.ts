export interface StudentProfile {
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  mobile: string;
  email: string;
  grade: number;
  parentMobile: string;
}

export interface GradeOption {
  id: number;
  name: string;
}
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';
