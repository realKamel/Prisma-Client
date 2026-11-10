import { computed, inject, Service, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Teacher } from '../../../../student/models/teacher.model';
import {
  StudentCurrentYear,
  TeacherCatalogService,
} from '../../../../teacher/services/teacher-catalog.service';

interface TeacherCatalogState {
  teachers: Teacher[];
  studentCurrentYear: StudentCurrentYear;
  isLoading: boolean;
  error: string | null;
}

/**
 * Signal-based store for the student teacher catalog.
 * Loads the full teacher list once; search, filtering and pagination
 * are handled client-side by the page.
 */
@Service()
export class TeacherCatalogStore {
  private readonly api = inject(TeacherCatalogService);
  private readonly initialState: TeacherCatalogState = {
    teachers: [],
    studentCurrentYear: null,
    isLoading: false,
    error: null,
  };
  // Private writable state — components must not touch it directly.
  private readonly _state = signal<TeacherCatalogState>(this.initialState);

  // Public read-only selectors
  readonly teachers = computed(() => this._state().teachers);
  /** The signed-in student's current academic year; null for anonymous users and non-students. */
  readonly studentCurrentYear = computed(() => this._state().studentCurrentYear);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  /**
   * Fetches all teachers. Existing teachers stay visible while a refresh is in flight
   * and are kept if the refresh fails.
   */
  loadTeachers(): void {
    // Prevent double-fetching while a request is already in flight.
    if (this._state().isLoading) return;

    this._state.update((s) => ({ ...s, isLoading: true, error: null }));

    this.api
      .getAllTeachers()
      .pipe(finalize(() => this._state.update((s) => ({ ...s, isLoading: false }))))
      .subscribe({
        next: ({ teachers, studentCurrentYear }) =>
          this._state.update((s) => ({ ...s, teachers, studentCurrentYear, error: null })),
        error: (err) =>
          this._state.update((s) => ({
            ...s,
            error: err?.message ?? 'تعذّر تحميل المدرسين',
          })),
      });
  }

  reset(): void {
    this._state.set(this.initialState);
  }
}