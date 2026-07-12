import { computed, inject, Injectable, injectAsync, Service, signal } from '@angular/core';
import { User } from '../Models/user';
import { StudentRegister } from '../../core/Models/StudentRegister';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  finalize,
  firstValueFrom,
  Observable,
  of,
  Subject,
  tap,
  timeout,
} from 'rxjs';
import { HttpClient, HttpContext } from '@angular/common/http';
import { UserLogin } from '../Models/UserLogin';
import { IResult } from '../Models/result';
import { ISendCode, ISendNewPassword, ISendEmail } from '../Models/Forgot-Password';
import { environment } from '../../../environments/environment.development';
import { AuthStore } from '../stores/user-store/user-store';
import { ApiResponse } from '../Models/ApiResponse';
import { Router } from '@angular/router';

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
  public isRefreshing = signal(false);
  // public refreshTokenSubject = new BehaviorSubject<boolean | null>(null);
  public refreshTokenSubject = new Subject<boolean>();
  private readonly router = inject(Router);

  sendOtp(email: ISendEmail): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/forgot-password`, email);
  }
  sendConfirm(otpCheck: ISendCode): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/confirm-code`, otpCheck);
  }
  sendPassword(NewPassword: ISendNewPassword): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/reset-password`, NewPassword);
  }
  logout(): void {
    // 1.user is logged out from app's perspective
    this.authStore.clearAuth();

    // 2. Tell the backend to clear cookies (fire & forget — don't block on it)
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(catchError(() => EMPTY)) // backend failure shouldn't affect client logout
      .subscribe();

    // 3. Navigate after clearing state
    this.router.navigate(['/login']);
  }

  loginEmail(user: UserLogin): Observable<ApiResponse<User>> {
    return this.http.post<IResult>(`${environment.apiUrl}/auth/login`, user).pipe(
      tap({
        next: ({ data }) => {
          if (data !== null) {
            this.authStore.setUser(data);
          }
        },
        error: (error) => {
          this.authStore.clearAuth();
          console.error(error);
        },
        complete: () => {
          console.log('login completed');
          this._checked.set(true);
        },
      }),
    );
  }
  register(student: StudentRegister): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/auth/register`, student);
  }
  sendEmailVerification(email:string): Observable<IResult>{
    return this.http.post<IResult>(`${environment.apiUrl}/auth/email-verify`, {email});
  }
  /**
   *
   * @description Used to fetch user data and check if still logged in
   * @return {*}  {(Promise<ApiResponse<User> | null>)}
   * @memberof AuthService
   */
  public async loadUserInfoAsync(): Promise<ApiResponse<User> | null> {
    console.trace('load is called from here:');
    return firstValueFrom(
      this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`, {}).pipe(
        timeout(8000),
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
        finalize(() => this._checked.set(true)),
      ),
    );
  }
  /**
   * @description Used in the fresh access token mechanism to call refresh endpoint to request a new access token using the expired access token + refresh token
   * @returns Observable<ApiResponse<null>>
   */
  public refreshToken(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${environment.apiUrl}/auth/refresh`, null, {
      withCredentials: true,
    });
  }

  get refreshToken$(): Observable<boolean> {
    return this.refreshTokenSubject.asObservable();
  }
}
