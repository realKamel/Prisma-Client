import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  Subject,
  tap,
  catchError,
  EMPTY,
  timeout,
  firstValueFrom,
  of,
  finalize,
} from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { AuthStore } from '../stores/auth.store';
import { UserLogin } from '../Models/UserLogin';
import { User } from '../Models/user';
import { StudentRegister } from '../Models/StudentRegister';

import { ISendCode, ISendEmail, ISendNewPassword } from '../Models/Forgot-Password';
import { AppRole } from '../enums/role-enum';

/**
 * Central auth store service.
 *
 * Components and guards should inject this service instead of reaching
 * directly into `AuthStore` or `AuthApiService`. It combines API calls
 * with reactive signal state so consumers only need to read signals and
 * call high-level methods.
 *
 * Signals are reactive — components using `ChangeDetectionStrategy.OnPush`
 * (or the default) will automatically update when auth state changes.
 */
@Service()
export class AuthStoreService {
  //Dependencies
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  //Whether a user is currently authenticated
  readonly isLoggedIn = computed(() => this.authStore.isAuthenticated());

  //Current user's role (e.g. 'student', 'teacher', 'admin')
  readonly role = computed(() => this.authStore.user()?.role);

  //Current user's full name
  readonly name = computed(() => this.authStore.fullName());

  //Current user's email
  readonly email = computed(() => this.authStore.user()?.email);

  //Current user object (nullable)
  readonly user = computed(() => this.authStore.user());

  //Whether the initial auth-check is complete
  readonly isAuthChecked = computed(() => this._isAuthChecked());

  //Loading state for any in-flight auth operation
  readonly isLoading = this.authStore.isLoading;

  //Token refresh coordination

  // Flag used by the HTTP interceptor to prevent concurrent refresh calls
  readonly isRefreshing = signal(false);

  //Subject that notifies queued requests when a token refresh completes
  readonly refreshTokenSubject = new Subject<boolean>();

  //Observable version of `refreshTokenSubject`
  readonly refreshToken$ = this.refreshTokenSubject.asObservable();

  //Private state
  private readonly _isAuthChecked = signal(false);

  // PUBLIC METHODS

  /**
   * Log in with email/phone + password.
   * On success the user is persisted in the store and navigation occurs.
   */
  login(credentials: UserLogin): Observable<User> {
    this.authStore.setLoading(true);
    return this.authApi.login(credentials).pipe(
      tap({
        next: (data) => {
          if (data) {
            this.authStore.setUser(data);
          }
        },
        error: () => {
          this.authStore.clearAuth();
        },
        complete: () => {
          this._isAuthChecked.set(true);
        },
      }),
      finalize(() => this.authStore.setLoading(false)),
    );
  }

  /** Register a new student account */
  register(student: StudentRegister) {
    this.authStore.setLoading(true);
    return this.authApi.register(student).pipe(finalize(() => this.authStore.setLoading(false)));
  }

  /** Send email verification link */
  sendEmailVerification(email: string) {
    this.authStore.setLoading(true);
    return this.authApi
      .sendEmailVerification(email)
      .pipe(finalize(() => this.authStore.setLoading(false)));
  }

  //Logout

  /**
   * Log the user out: clear local state, notify backend, navigate to login.
   */
  logout(): void {
    this.authStore.clearAuth();

    //Fire & forget — backend failure shouldn't block client logout
    this.router.navigate(['/login']);

    this.authApi
      .logout()
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }

  //Forgot-password flow

  //Send OTP to the given email
  sendOtp(email: ISendEmail) {
    this.authStore.setLoading(true);
    return this.authApi.sendOtp(email).pipe(finalize(() => this.authStore.setLoading(false)));
  }

  // Confirm the OTP code
  sendConfirm(otpCheck: ISendCode) {
    this.authStore.setLoading(true);
    return this.authApi
      .sendConfirm(otpCheck)
      .pipe(finalize(() => this.authStore.setLoading(false)));
  }

  // Set a new password after OTP confirmation
  sendPassword(newPassword: ISendNewPassword) {
    this.authStore.setLoading(true);
    return this.authApi
      .sendPassword(newPassword)
      .pipe(finalize(() => this.authStore.setLoading(false)));
  }

  //Session restoration

  /**
   * Fetch the current user from `/auth/me` and update the store.
   * Called once during app initialization.
   */
  async loadUserInfo(): Promise<User | null> {
    this.authStore.setLoading(true);
    return firstValueFrom(
      this.authApi.loadUserInfo().pipe(
        timeout(10_000),
        tap((user) => {
          if (user) {
            this.authStore.setUser(user);
          }
        }),
        catchError((err) => {
          console.error('Auth check failed:', err);
          this.authStore.clearAuth();

          return of(null);
        }),
        finalize(() => this._isAuthChecked.set(true)),
        finalize(() => this.authStore.setLoading(false)),
      ),
    );
  }

  //Token refresh

  /** Request a new access token via the refresh-token cookie */
  refreshToken() {
    return this.authApi.refreshToken();
  }

  //Helpers

  /** Check whether the user has a specific role */
  hasRole(role: AppRole): boolean {
    return this.role()?.toLowerCase() === role.toLowerCase();
  }

  /**
   * Clear auth state without navigating away.
   * Used by the HTTP interceptor when a refresh-token attempt fails.
   */
  clearAuthState(): void {
    this.authStore.clearAuth();
  }
}
