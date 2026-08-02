import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserLogin } from '../Models/UserLogin';
import { User } from '../Models/user';
import { StudentRegister } from '../Models/StudentRegister';
import { ISendCode, ISendEmail, ISendNewPassword } from '../Models/Forgot-Password';

/**
 * Pure API service for authentication endpoints.
 * No state management — just HTTP calls.
 */
@Service()
export class AuthApiService {
  private readonly http = inject(HttpClient);

  /** Log in with email/phone + password */
  login(user: UserLogin): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, user);
  }

  /** Register a new student */
  register(student: StudentRegister) {
    return this.http.post(`${environment.apiUrl}/auth/register`, student);
  }

  /** Send OTP for password reset */
  sendOtp(email: ISendEmail) {
    return this.http.post(`${environment.apiUrl}/Auth/forgot-password`, email);
  }

  /** Confirm OTP code */
  sendConfirm(otpCheck: ISendCode) {
    return this.http.post(`${environment.apiUrl}/Auth/confirm-code`, otpCheck);
  }

  /** Set new password after OTP confirmation */
  sendPassword(newPassword: ISendNewPassword) {
    return this.http.post(`${environment.apiUrl}/Auth/reset-password`, newPassword);
  }

  /** Send email verification after registration */
  sendEmailVerification(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/email-verify`, { email });
  }

  /** Notify the backend to clear the auth cookie */
  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true });
  }

  /** Fetch current user data from /auth/me */
  loadUserInfo(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`);
  }

  /** Request a new access token using the refresh token cookie */
  refreshToken() {
    return this.http.post(`${environment.apiUrl}/auth/refresh`, null, {
      withCredentials: true,
    });
  }
}
