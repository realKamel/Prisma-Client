import { computed, inject, Service, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LessonStatus, StudentHistoryResponse, History } from '../models/history.models';

@Service()
export class StudentService {
  private readonly _HttpClient = inject(HttpClient);

  private responseState = signal<StudentHistoryResponse | null>(null);

  readonly activeFilter = signal<LessonStatus>('All');

  readonly systemStats = computed(() => this.responseState()?.status ?? null);

  // Computed array mapping and running logic filters downstream
  readonly filteredHistory = computed<History[]>(() => {
    const state = this.responseState();
    if (!state) return [];

    const filter = this.activeFilter();
    if (filter === 'All') return state.history;

    return state.history.filter((item) => item.status === filter);
  });

  // Reactive counters mapping metrics on current slice configurations
  readonly filterCounts = computed(() => {
    const history = this.responseState()?.history ?? [];
    return {
      All: history.length,
      Active: history.filter((h) => h.status === 'Active').length,
      Done: history.filter((h) => h.status === 'Done').length,
      Expired: history.filter((h) => h.status === 'Expired').length,
    };
  });

  loadHistoryState(mockPayload: StudentHistoryResponse) {
    this.responseState.set(mockPayload);
  }

  updateFilter(newFilter: LessonStatus): void {
    this.activeFilter.set(newFilter);
  }
  public GetStudentHistory(): Observable<StudentHistoryResponse> {
    return this._HttpClient
      .get<StudentHistoryResponse>(`${environment.apiUrl}/Students/history`)
      .pipe(
        tap((data) => {
          this.responseState.set(data);
        }),
      );
  }
}
