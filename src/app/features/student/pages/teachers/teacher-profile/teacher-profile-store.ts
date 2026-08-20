import { computed, inject, Service, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { TeacherProfile } from '../../../../../core/Models/Student/teacher-profile.model';
import { TeacherCatalogService } from '../../../../../core/Services/teacher-catalog.service';

interface TeacherProfileState {
  profile: TeacherProfile | null;
  isLoading: boolean;
  error: string | null;
  teacherId: string | null;
}

/**
 * Signal-based store for a single teacher's public profile page.
 * Owns the single `GET /students/teachers/{id}` call and exposes read-only
 * computed selectors for the smart container component.
 *
 * Switching teacher ids resets the state and refetches automatically.
 */
@Service()
export class TeacherProfileStore {
  private readonly api = inject(TeacherCatalogService);
  private readonly initialState: TeacherProfileState = {
    profile: null,
    isLoading: false,
    error: null,
    teacherId: null,
  };
  // Private writable state — components must not touch it directly.
  private readonly _state = signal<TeacherProfileState>(this.initialState);

  // Public read-only selectors
  readonly profile = computed(() => this._state().profile);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  /**
   * Loads the profile for the given teacher.
   * When the teacher changes, the previous profile is cleared before fetching.
   */
  loadProfile(teacherId: string): void {
    if (!teacherId) return;

    const s = this._state();
    if (s.teacherId !== teacherId) {
      this._state.set({ ...this.initialState, teacherId });
      this.fetchProfile();
      return;
    }

    // Prevent double-fetching while a request is already in flight.
    if (s.isLoading) return;
    this.fetchProfile();
  }

  private fetchProfile(): void {
    const { teacherId } = this._state();
    if (!teacherId) return;

    this._state.update((st) => ({ ...st, isLoading: true, error: null }));

    this.api
      .getTeacherProfile(teacherId)
      .pipe(finalize(() => this._state.update((st) => ({ ...st, isLoading: false }))))
      .subscribe({
        next: (profile) => this._state.update((st) => ({ ...st, profile, error: null })),
        error: (err) =>
          this._state.update((st) => ({
            ...st,
            profile: null,
            error: err?.message ?? 'تعذّر تحميل الملف الشخصي للمدرس',
          })),
      });
  }

  reset(): void {
    this._state.set(this.initialState);
  }
}
