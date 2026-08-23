import { computed, inject, Service, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Lesson } from '../../../../core/Models/lesson-model';
import { TeacherLessonsService } from '../../../../core/Services/teacher-lessons.service';
import { toLesson } from '../../../../core/Models/Student/teacher-lesson.model';

interface TeacherLessonsState {
  lessons: Lesson[];
  isLoading: boolean;
  error: string | null;
  teacherId: string | null;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  keyword: string;
}

/**
 * Signal-based store for a single teacher's lesson catalog.
 * Owns the paged API call (teacherId/pageNumber/pageSize/keyword) and exposes
 * read-only computed selectors for the smart container component.
 *
 * Switching teachers (or keyword changes) resets to page 1 automatically.
 */
@Service()
export class TeacherLessonsStore {
  private readonly api = inject(TeacherLessonsService);
  private readonly initialState: TeacherLessonsState = {
    lessons: [],
    isLoading: false,
    error: null,
    teacherId: null,
    pageNumber: 1,
    pageSize: 9,
    totalPages: 0,
    totalRecords: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    keyword: '',
  };
  // Private writable state — components must not touch it directly.
  private readonly _state = signal<TeacherLessonsState>(this.initialState);

  // Public read-only selectors
  readonly lessons = computed(() => this._state().lessons);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // Pagination selectors
  readonly pageNumber = computed(() => this._state().pageNumber);
  readonly pageSize = computed(() => this._state().pageSize);
  readonly totalPages = computed(() => this._state().totalPages);
  readonly totalRecords = computed(() => this._state().totalRecords);
  readonly hasNextPage = computed(() => this._state().hasNextPage);
  readonly hasPrevPage = computed(() => this._state().hasPreviousPage);

  /** Server-reported total across all pages. */
  readonly totalLessons = computed(() => this._state().totalRecords);

  /**
   * Loads the current page for the given teacher.
   * When the teacher changes, pagination + keyword are reset to page 1.
   */
  loadLessons(teacherId: string): void {
    if (!teacherId) return;

    const s = this._state();
    if (s.teacherId !== teacherId) {
      this._state.set({ ...this.initialState, teacherId });
      this.fetchCurrentPage();
      return;
    }

    // Prevent double-fetching while a request is already in flight.
    if (s.isLoading) return;
    this.fetchCurrentPage();
  }

  private fetchCurrentPage(): void {
    const { teacherId, pageNumber, pageSize, keyword } = this._state();
    if (!teacherId) return;

    this._state.update((st) => ({ ...st, isLoading: true, error: null }));

    this.api
      .getTeacherLessons(teacherId, pageNumber, pageSize, keyword)
      .pipe(finalize(() => this._state.update((st) => ({ ...st, isLoading: false }))))
      .subscribe({
        next: (result) =>
          this._state.update((st) => ({
            ...st,
            lessons: (result?.items ?? []).map(toLesson),
            pageNumber: result?.pageNumber ?? st.pageNumber,
            totalPages: result?.totalPages ?? st.totalPages,
            totalRecords: result?.totalCount ?? st.totalRecords,
            hasPreviousPage: result?.hasPreviousPage ?? false,
            hasNextPage: result?.hasNextPage ?? false,
            error: null,
          })),
        error: (err) =>
          this._state.update((st) => ({
            ...st,
            error: err?.message ?? 'تعذّر تحميل الدروس',
          })),
      });
  }

  /** Navigates to a specific page (clamped to the valid range). */
  goToPage(page: number): void {
    const s = this._state();
    const max = Math.max(s.totalPages, 1);
    const target = Math.min(Math.max(page, 1), max);
    if (target === s.pageNumber) return;
    this._state.update((st) => ({ ...st, pageNumber: target }));
    this.fetchCurrentPage();
  }

  nextPage(): void {
    if (this.hasNextPage()) this.goToPage(this._state().pageNumber + 1);
  }

  prevPage(): void {
    if (this.hasPrevPage()) this.goToPage(this._state().pageNumber - 1);
  }

  /** Applies the server-side keyword search and resets to the first page. */
  setKeyword(keyword: string): void {
    const q = keyword.trim();
    const s = this._state();
    if (s.keyword === q && s.pageNumber === 1) return;
    this._state.update((st) => ({ ...st, keyword: q, pageNumber: 1 }));
    this.fetchCurrentPage();
  }

  reset(): void {
    this._state.set(this.initialState);
  }
}
