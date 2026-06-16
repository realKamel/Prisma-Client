import { computed, inject, Injectable, Service, signal } from '@angular/core';
import { User } from '../Models/user';
import { StudentRegister } from '../../core/Models/StudentRegister';
import { catchError, finalize, firstValueFrom, Observable, of, tap, timeout } from 'rxjs';
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
  private readonly _checked = signal(false);
  public readonly isAuthChecked = computed(() => this._checked());

  // login(user: User): void {
  //   this.authStore.setUser(user);
  // }

  sendOtp(email: ISendEmail): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/forgot-password`, email);
  }
  sendConfirm(otpCheck: ISendCode): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/confirm-code`, otpCheck);
  }
  sendPassword(NewPassword: ISendNewPassword): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/reset-password`, NewPassword);
  }
  logout(): Observable<ApiResponse<null>> {
    return this.http
      .post<IResult>(`${environment.apiUrl}/Auth/logout`, null)
      .pipe(finalize(() => this.authStore.clearAuth()));
  }
  loginEmail(user: UserLogin): Observable<ApiResponse<User>> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/login`, user).pipe(
      tap(
        ({ succeeded, data }) => {
          if (succeeded && data !== null) {
            // const user: User = { ...data, fullName: data.firstName };
            this.authStore.setUser(data);
          } else {
            this.authStore.clearAuth();
          }
        },
        finalize(() => this._checked.set(true)),
      ),
    );
  }
  register(student: StudentRegister): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/register`, student);
  }

  public async loadUserInfoAsync() {
    return firstValueFrom(
      this.http
        .get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
        .pipe(
          timeout(5000),
          tap(({ succeeded, data }) => {
            if (succeeded && data !== null) {
              this.authStore.setUser(data);
            } else {
              this.authStore.clearAuth();
            }
            console.log(this.isAuthChecked());
          }),
          catchError((err) => {
            console.error('Auth check failed:', err);
            this.authStore.clearAuth();
            return of(null); // emit something so stream completes
          }),
          finalize(() => {
            return this._checked.set(true);
          }),
        ),
    );
  }
}
