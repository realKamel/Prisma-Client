import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../Models/user';
import { StudentRegister } from '../../core/Models/StudentRegister';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserLogin } from '../Models/UserLogin';
import { IResult } from '../Models/result';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient)
  private _currentUser = signal<User | null>(null);

  currentUser = this._currentUser.asReadonly();

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
  logoutAccount():Observable<IResult>{
    return this.http.post<IResult>('https://localhost:7109/api/v1/Auth/logout',null)
  }
  loginEmail(user:UserLogin):Observable<IResult>{
    return this.http.post<IResult>('https://localhost:7109/api/v1/Auth/login',user)
  }
  register(student: StudentRegister): Observable<IResult> {
    return this.http.post<IResult>('https://localhost:7109/api/v1/Auth/register', student);
  }
}
