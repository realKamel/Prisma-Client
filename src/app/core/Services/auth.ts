import { computed, Injectable, Service, signal } from '@angular/core';
import { User } from '../Models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
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
}
