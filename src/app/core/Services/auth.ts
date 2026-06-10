import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../Models/user';
import { StudentRegister } from '../../core/Models/StudentRegister';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserLogin } from '../Models/UserLogin';
import { IResult } from '../Models/result';
import { ISendCode, ISendNewPassword, ISendEmail } from '../Models/Forgot-Password';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient)
  private _currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => this._currentUser() !== null);
  role = computed(() => this._currentUser()?.role ?? null);
  name = computed(() => this._currentUser()?.name ?? null);
  email = computed(() => this._currentUser()?.email ?? null);

  login(user: User): void {
    this._currentUser.set(user);
  }
  logout(): void {
    this._currentUser.set(null);
  }
  sendOtp(email:ISendEmail):Observable<IResult>{
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/forgot-password`,email)
  }
  sendConfirm(otpCheck:ISendCode):Observable<IResult>{
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/confirm-code`,otpCheck)
  }
  sendPassword(NewPassword:ISendNewPassword):Observable<IResult>{
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/reset-password`,NewPassword)
  }
  logoutAccount():Observable<IResult>{
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/logout`,null)
  }
  loginEmail(user:UserLogin):Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/Auth/login`,user)
  }
  register(student: StudentRegister): Observable<IResult> {
    return this.http.post<IResult>(`${environment.apiUrl}/Auth/register`, student);
  }
}
