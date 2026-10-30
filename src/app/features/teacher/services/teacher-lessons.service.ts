import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { defer, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PaginatedList } from '../../../shared/models/paged-result.model';
import {
  LessonStatus,
  StatusCounts,
  TeacherLesson,
  TeacherLessonsQuery,
  TeacherLessonsResponse,
} from '../models/Teacherlesson.model';

type PageInfo = Omit<PaginatedList<TeacherLesson>, 'items'>;

/**
 * Teacher-facing lessons API service. Search, status filter, sort and paging
 * all run on the server; this service only holds the latest page it received.
 */
@Service()
export class TeacherLessonsService {
  private readonly http = inject(HttpClient);

  private readonly _lessons = signal<TeacherLesson[]>([]);
  private readonly _page = signal<PageInfo>({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  private readonly _counts = signal<StatusCounts>({ all: 0, active: 0, hidden: 0, drafted: 0 });
  private readonly _loading = signal(false);

  public readonly lessons = this._lessons.asReadonly();
  public readonly page = this._page.asReadonly();
  public readonly counts = this._counts.asReadonly();
  public readonly loading = this._loading.asReadonly();

  public load(query: TeacherLessonsQuery): Observable<TeacherLessonsResponse> {
    // defer: the loading flag flips when the request actually starts,
    // so a cancelled (switchMap'd) request can't clear a newer one's flag.
    return defer(() => {
      this._loading.set(true);

      let params = new HttpParams()
        .set('pageNumber', query.page)
        .set('pageSize', query.pageSize)
        .set('sort', query.sort);
      if (query.search) params = params.set('search', query.search);
      if (query.status !== 'all') params = params.set('status', query.status);

      return this.http
        .get<TeacherLessonsResponse>(`${environment.apiUrl}/Teachers/lessons`, { params })
        .pipe(
          tap(({ lessons, counts }) => {
            const { items, ...page } = lessons;
            this._lessons.set(items ?? []);
            this._page.set(page);
            this._counts.set(counts);
          }),
          finalize(() => this._loading.set(false)),
        );
    });
  }

  public toggleStatus(id: number): void {
    const lesson = this._lessons().find((l) => l.id === id);
    if (!lesson || lesson.status === 'drafted') return;

    const previous = lesson.status;
    const next: LessonStatus = previous === 'hidden' ? 'active' : 'hidden';

    // Optimistic update, rolled back if the request fails.
    this.applyStatus(id, previous, next);

    this.http.patch(`${environment.apiUrl}/Lessons/${id}/toggle-status`, {}).subscribe({
      next: () =>
        toast.success(
          `تم تغيير حالة الدرس "${lesson.name}" إلى ${next === 'active' ? 'نشط' : 'مخفي'}.`,
        ),
      error: () => this.applyStatus(id, next, previous),
    });
  }

  /** Doesn't touch local state: the caller reloads so totals and paging stay correct. */
  public deleteLesson(id: number) {
    return this.http.delete(`${environment.apiUrl}/Lessons/${id}`);
  }

  private applyStatus(id: number, from: LessonStatus, to: LessonStatus): void {
    this._lessons.update((list) => list.map((l) => (l.id === id ? { ...l, status: to } : l)));
    this._counts.update((c) => ({ ...c, [from]: c[from] - 1, [to]: c[to] + 1 }));
  }
}