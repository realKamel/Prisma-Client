import { computed, Service, signal } from '@angular/core';
import { User } from '../../Models/user';
import { AppRole } from '../../enums/role-enum';
import { PolicyEnum } from '../../../features/teacher/pages/my-assistants/assistants.model';

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
  readonly user = computed(() => this._state().user);
  readonly fullName = computed(
    () => `${this._state().user?.firstName} ${this._state().user?.secondName}`,
  );
  readonly isLoading = computed(() => this._state().isLoading);
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly error = computed(() => this._state().error);

  // Derived computed values

  readonly hasRole = (checkedRole: AppRole) =>
    computed(() => this._state().user?.role.toLowerCase() == checkedRole.toLowerCase());

  public readonly hasPermission = (permission: PolicyEnum) =>
    computed(() => this._state().user?.permissions?.includes(permission));

  // Actions / Methods
  setUser(user: User): void {
    this._state.update((state) => ({
      ...state,
      user,
      isAuthenticated: !!user,
      error: null,
    }));
  }

  clearUser(): void {
    this._state.update((state) => ({ ...state, user: null, error: null, isAuthenticated: false }));
  }

  setLoading(loading: boolean) {
    this._state.update((state) => ({ ...state, isLoading: loading }));
  }

  setError(error: string | null) {
    this._state.update((state) => ({ ...state, error, isLoading: false }));
  }

  clearAuth() {
    this._state.set({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  }
}
