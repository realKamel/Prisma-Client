import { computed, inject, Service, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { finalize } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LessonStatus, StudentHistoryResponse, History, Status } from '../models/history.models';

interface HistoryState {
  items: History[];
  status: Status | null;
  isLoading: boolean;
  error: string | null;
  pageNumber: number; // 1-based (UI) — converted to 0-based on the wire
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Signal-based store for the student history page.
 * Owns the paged history call (0-based pageNumber/pageSize) and the
 * separate performance call — same pattern as the teacher catalog store.
 */
@Service()
export class StudentService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly initialState: HistoryState = {
    items: [],
    status: null,
    isLoading: false,
    error: null,
    pageNumber: 1,
    pageSize: 5,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  private readonly _state = signal<HistoryState>(this.initialState);

  // Client-side status filter (applied to the fetched page, like teacher list).
  readonly activeFilter = signal<LessonStatus>('All');

  //selectors
  readonly history = computed(() => this._state().items);
  readonly systemStats = computed(() => this._state().status);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // Pagination selectors (server-driven)
  readonly pageNumber = computed(() => this._state().pageNumber);
  readonly pageSize = computed(() => this._state().pageSize);
  readonly totalPages = computed(() => this._state().totalPages);
  readonly totalCount = computed(() => this._state().totalCount);
  readonly hasNextPage = computed(() => this._state().hasNextPage);
  readonly hasPrevPage = computed(() => this._state().hasPreviousPage);

  /** The fetched page, filtered by the active status (client-side). */
  readonly filteredHistory = computed<History[]>(() => {
    const page = this._state().items;
    const filter = this.activeFilter();
    if (filter === 'All') return page;
    return page.filter((item) => item.status === filter);
  });

  /** Chip counters: All = server total, the rest = within the loaded page. */
  readonly filterCounts = computed(() => {
    const page = this._state().items;
    return {
      All: this.totalCount(),
      Active: page.filter((h) => h.status === 'Active').length,
      Done: page.filter((h) => h.status === 'Done').length,
      Expired: page.filter((h) => h.status === 'Expired').length,
    };
  });

  /** Fetches the current page from the server (0-based pageNumber on the wire). */
  loadHistory(): void {
    if (this._state().isLoading) return;

    const { pageNumber, pageSize } = this._state();
    this._state.update((s) => ({ ...s, isLoading: true, error: null }));

    this._HttpClient
      .get<StudentHistoryResponse>(`${environment.apiUrl}/Students/history`, {
        params: new HttpParams()
          .set('pageNumber', String(pageNumber - 1))
          .set('pageSize', String(pageSize)),
      })
      .pipe(finalize(() => this._state.update((s) => ({ ...s, isLoading: false }))))
      .subscribe({
        next: (res) =>
          this._state.update((s) => ({
            ...s,
            items: res?.items ?? [],
            pageNumber: (res?.pageNumber ?? 0) + 1,
            pageSize: res?.pageSize ?? s.pageSize,
            totalPages: res?.totalPages ?? s.totalPages,
            totalCount: res?.totalCount ?? s.totalCount,
            hasNextPage: res?.hasNextPage ?? s.hasNextPage,
            hasPreviousPage: res?.hasPreviousPage ?? s.hasPreviousPage,
            error: null,
          })),
        error: (err) => {
          console.error(err);
        },
      });
  }

  /** Fetches the performance stats from the server. */
  loadPerformance(): void {
    this._HttpClient.get<Status>(`${environment.apiUrl}/students/performance`).subscribe({
      next: (status) => this._state.update((s) => ({ ...s, status })),
      error: (err) => {
        console.error(err);
      },
    });
  }

  /** Navigates to a specific page (clamped to the valid range). */
  goToPage(page: number): void {
    const max = Math.max(this._state().totalPages, 1);
    const target = Math.min(Math.max(page, 1), max);
    if (target === this._state().pageNumber) return;
    this._state.update((st) => ({ ...st, pageNumber: target }));
    this.loadHistory();
  }

  nextPage(): void {
    if (this.hasNextPage()) this.goToPage(this._state().pageNumber + 1);
  }

  prevPage(): void {
    if (this.hasPrevPage()) this.goToPage(this._state().pageNumber - 1);
  }

  /** Applies the client-side status filter (keeps the current page). */
  updateFilter(newFilter: LessonStatus): void {
    this.activeFilter.set(newFilter);
  }
}
