import { computed, inject, Service, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Teacher } from '../../../../../core/Models/Student/teacher.model';
import { TeacherCatalogService } from '../../../../../core/Services/teacher-catalog.service';

interface TeacherCatalogState {
  teachers: Teacher[];
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  search: string;
}

/**
 * Signal-based store for the student teacher catalog.
 * Owns the paged API call (pageNumber/pageSize/search) and exposes
 * read-only computed selectors for the smart container component.
 */
@Service()
export class TeacherCatalogStore {
  private readonly api = inject(TeacherCatalogService);
  private readonly initialState: TeacherCatalogState = {
    teachers: [],
    isLoading: false,
    error: null,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
    search: '',
  };
  // Private writable state — components must not touch it directly.
  private readonly _state = signal<TeacherCatalogState>(this.initialState);

  // Public read-only selectors
  readonly teachers = computed(() => this._state().teachers);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // Pagination selectors
  readonly pageNumber = computed(() => this._state().pageNumber);
  readonly pageSize = computed(() => this._state().pageSize);
  readonly totalPages = computed(() => this._state().totalPages);
  readonly totalRecords = computed(() => this._state().totalRecords);
  readonly hasNextPage = computed(() => this._state().pageNumber < this._state().totalPages);
  readonly hasPrevPage = computed(() => this._state().pageNumber > 1);

  // Derived slices
  /** Server-reported total across all pages. */
  readonly totalTeachers = computed(() => this._state().totalRecords);
  /** Featured count within the currently loaded page. */
  readonly featuredCount = computed(() => this.teachers().filter((t) => t.featured).length);

  /** Fetches the current page (pageNumber/pageSize/search). */
  loadTeachers(): void {
    // Prevent double-fetching while a request is already in flight.
    if (this._state().isLoading) return;

    const { pageNumber, pageSize, search } = this._state();
    this._state.update((s) => ({ ...s, isLoading: true, error: null }));

    this.api
      .getTeachers(pageNumber, pageSize, search)
      .pipe(finalize(() => this._state.update((s) => ({ ...s, isLoading: false }))))
      .subscribe({
        next: (result) =>
          this._state.update((s) => ({
            ...s,
            teachers: result?.items ?? [],
            pageNumber: result?.pageNumber ?? s.pageNumber,
            totalPages: result?.totalPages ?? s.totalPages,
            totalRecords: result?.totalCount ?? s.totalRecords,
            error: null,
          })),
        error: (err) =>
          this._state.update((s) => ({
            ...s,
            error: err?.message ?? 'تعذّر تحميل المدرسين',
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
    this.loadTeachers();
  }

  nextPage(): void {
    if (this.hasNextPage()) this.goToPage(this._state().pageNumber + 1);
  }

  prevPage(): void {
    if (this.hasPrevPage()) this.goToPage(this._state().pageNumber - 1);
  }

  /** Applies the server-side search and resets to the first page. */
  setSearch(query: string): void {
    const q = query.trim();
    const s = this._state();
    if (s.search === q && s.pageNumber === 1) return;
    this._state.update((st) => ({ ...st, search: q, pageNumber: 1 }));
    this.loadTeachers();
  }

  reset(): void {
    this._state.set(this.initialState);
  }
}
