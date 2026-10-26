import { computed, effect, Service, signal } from '@angular/core';
import { PolicyEnum } from '../../features/teacher/pages/my-assistants/assistants.model';
import { AppRole } from '../enums/role-enum';
import { User } from '../models/auth/user.model';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
@Service()
export class AuthStore {
  // Private writable signals
  private readonly _state = signal<AuthState>({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  });

  // Public readonly computed signals
  public readonly user = computed(() => this._state().user);
  public readonly fullName = computed(
    () => `${this._state().user?.firstName} ${this._state().user?.secondName}`,
  );
  public readonly isLoading = computed(() => this._state().isLoading);
  public readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  public readonly error = computed(() => this._state().error);
  constructor() {
    effect(() => {
      localStorage.setItem('isLoggedOut', JSON.stringify(!this.isAuthenticated()));
    });
  }
  // Derived computed values

  public readonly hasRole = (checkedRole: AppRole) =>
    computed(() => this._state().user?.role.toLowerCase() == checkedRole.toLowerCase());

  public readonly hasPermission = (permission: PolicyEnum) =>
    computed(() => this._state().user?.permissions?.includes(permission));

  // Actions / Methods
  public setUser(user: User): void {
    this._state.update((state) => ({
      ...state,
      user,
      isAuthenticated: !!user,
      error: null,
    }));
  }

  public clearUser(): void {
    this._state.update((state) => ({ ...state, user: null, error: null, isAuthenticated: false }));
  }

  public setLoading(loading: boolean) {
    this._state.update((state) => ({ ...state, isLoading: loading }));
  }

  public setError(error: string | null) {
    this._state.update((state) => ({ ...state, error, isLoading: false }));
  }

  public clearAuth() {
    this._state.set({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  }
}
