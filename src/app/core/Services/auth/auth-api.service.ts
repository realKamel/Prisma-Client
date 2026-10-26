import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ISendCode, ISendEmail, ISendNewPassword } from '../../models/auth/forgot-password.model';
import { StudentRegister } from '../../models/auth/student-register';
import { UserLogin } from '../../models/auth/user-login';
import { User } from '../../models/auth/user.model';

/**
 * Pure API service for authentication endpoints.
 * No state management — just HTTP calls.
 */
@Service()
export class AuthApiService {
  private readonly http = inject(HttpClient);

  /** Log in with email/phone + password */
  public login(user: UserLogin): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, user);
  }

  /** Register a new student */
  public register(student: StudentRegister) {
    return this.http.post(`${environment.apiUrl}/auth/register`, student);
  }

  /** Send OTP for password reset */
  public sendOtp(email: ISendEmail) {
    return this.http.post(`${environment.apiUrl}/Auth/forgot-password`, email);
  }

  /** Confirm OTP code */
  public sendConfirm(otpCheck: ISendCode) {
    return this.http.post(`${environment.apiUrl}/Auth/confirm-code`, otpCheck);
  }

  /** Set new password after OTP confirmation */
  public sendPassword(newPassword: ISendNewPassword) {
    return this.http.post(`${environment.apiUrl}/Auth/reset-password`, newPassword);
  }

  /** Send email verification after registration */
  public sendEmailVerification(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/email-verify`, { email });
  }

  /** Notify the backend to clear the auth cookie */
  public logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true });
  }

  /** Fetch current user data from /auth/me */
  public loadUserInfo(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`);
  }

  /** Request a new access token using the refresh token cookie */
  public refreshToken() {
    return this.http.post(`${environment.apiUrl}/auth/refresh`, null, {
      withCredentials: true,
    });
  }
}
