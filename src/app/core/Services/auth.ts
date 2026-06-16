import { computed, inject, Injectable, Service, signal } from '@angular/core';
import { User } from '../Models/user';
import { StudentRegister } from '../../core/Models/StudentRegister';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserLogin } from '../Models/UserLogin';
import { IResult } from '../Models/result';
import { ISendCode, ISendNewPassword, ISendEmail } from '../Models/Forgot-Password';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../stores/user-store/user-store';
import { ApiResponse } from '../Models/ApiResponse';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);
  public readonly isLoggedIn = computed(() => this.authStore.isAuthenticated());
  public readonly role = computed(() => this.authStore.user()?.role);
  public readonly name = computed(() => this.authStore.fullName());
  public readonly email = computed(() => this.authStore.user()?.email);

  // login(user: User): void {
  //   this.authStore.setUser(user);
  // }
  logout(): void {
    this.authStore.clearAuth();
  }

  sendOtp(email: ISendEmail): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/forgot-password`, email);
  }
  sendConfirm(otpCheck: ISendCode): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/confirm-code`, otpCheck);
  }
  sendPassword(NewPassword: ISendNewPassword): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/reset-password`, NewPassword);
  }
  logoutAccount(): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/logout`, null);
  }
  loginEmail(user: UserLogin): Observable<ApiResponse<User>> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/login`, user).pipe(
      tap(({ succeeded, data }) => {
        if (succeeded && data !== null) {
          // const user: User = { ...data, fullName: data.firstName };
          this.authStore.setUser(data);
        } else {
          this.authStore.clearAuth();
        }
      }),
    );
  }
  register(student: StudentRegister): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/register`, student);
  }
  public loadUserInfo() {
    return this.http
      .get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(
        tap(({ succeeded, data }) => {
          if (succeeded && data !== null) {
            // const user: User = { ...data, fullName: data.firstName };
            this.authStore.setUser(data);
          } else {
            this.authStore.clearAuth();
          }
        }),
      );
  }
}
