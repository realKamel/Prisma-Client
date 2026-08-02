import { inject, Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserLogin } from '../Models/UserLogin';
import { User } from '../Models/user';
import { StudentRegister } from '../Models/StudentRegister';
import { ISendCode, ISendNewPassword, ISendEmail } from '../Models/Forgot-Password';
import { AuthStoreService } from './auth-store.service';

/**
 * Legacy facade that delegates to AuthStoreService.
 *
 * Existing consumers can keep importing this service — it proxies
 * every public member to the new AuthStoreService.
 *
 * For new code, prefer injecting AuthStoreService directly.
 *
 * @deprecated Use {@link AuthStoreService} directly instead.
 */
@Service()
export class AuthService {
  private readonly authStoreService = inject(AuthStoreService);

  //signals
  readonly isLoggedIn = this.authStoreService.isLoggedIn;
  readonly role = this.authStoreService.role;
  readonly name = this.authStoreService.name;
  readonly email = this.authStoreService.email;
  readonly user = this.authStoreService.user;
  readonly isAuthChecked = this.authStoreService.isAuthChecked;
  readonly isLoading = this.authStoreService.isLoading;
  readonly isRefreshing = this.authStoreService.isRefreshing;
  readonly refreshTokenSubject: Subject<boolean> = this.authStoreService.refreshTokenSubject;
  readonly refreshToken$ = this.authStoreService.refreshToken$;

  // Auth methods

  loginEmail(user: UserLogin): Observable<User> {
    return this.authStoreService.login(user);
  }

  register(student: StudentRegister) {
    return this.authStoreService.register(student);
  }

  sendOtp(email: ISendEmail) {
    return this.authStoreService.sendOtp(email);
  }

  sendConfirm(otpCheck: ISendCode) {
    return this.authStoreService.sendConfirm(otpCheck);
  }

  sendPassword(newPassword: ISendNewPassword) {
    return this.authStoreService.sendPassword(newPassword);
  }

  sendEmailVerification(email: string) {
    return this.authStoreService.sendEmailVerification(email);
  }

  logout(): void {
    this.authStoreService.logout();
  }

  loadUserInfoAsync(): Promise<User | null> {
    return this.authStoreService.loadUserInfo();
  }

  refreshToken() {
    return this.authStoreService.refreshToken();
  }
}
