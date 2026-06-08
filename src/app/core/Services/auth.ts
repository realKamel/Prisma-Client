import { computed, inject, Injectable, Service, signal } from '@angular/core';
import { User } from '../Models/user';
import { StudentRegister } from '../../core/Models/StudentRegister';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient)
  private _currentUser = signal<User | null>(null);

  currentUser = this._currentUser.asReadonly();

  isLoggedIn = computed(() => this._currentUser() !== null);
  role = computed(() => this._currentUser()?.role ?? null);

  login(user: User): void {
    this._currentUser.set(user);
  }

  logout(): void {
    this._currentUser.set(null);
  }

  register(student: StudentRegister): Observable<any> {
    return this.http.post<any>('https://localhost:7109/api/v1/Auth/register', student);
  }
}
