import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PagedResult, PaginatedList } from '../../../core/Models/paged-result.model';
import { IProblemDetails } from '../../../core/Models/problemDetails';
import { LessonStatus, TeacherLesson } from '../../../core/Models/Teacher/Teacherlesson.model';
/**
 * Student-facing teacher lessons API service.
 * Fetches the paged, searchable lesson catalog of a single teacher
 * from `GET /students/teachers/{id}/lessons`.
 */
@Service()
export class TeacherLessonsService {
  private readonly http = inject(HttpClient);
  private readonly _lessons = signal<TeacherLesson[]>([]);

  public getTeacherLessons(
    teacherId: string,
    pageNumber = 1,
    pageSize = 10,
    keyword = '',
  ): Observable<PagedResult<TeacherLesson>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    if (keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }

    return this.http
      .get<PagedResult<TeacherLesson>>(`${environment.apiUrl}/teachers/${teacherId}/lessons`, {
        params,
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const problem = err.error as IProblemDetails | undefined;
          console.error(
            '[TeacherLessonsService] HTTP error:',
            err.status,
            problem?.title ?? problem?.detail ?? err.message,
          );
          return of({
            pageNumber: 1,
            pageSize,
            totalCount: 0,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
            items: [],
          });
        }),
      );
  }

  /** Expose as readonly signal */
  public readonly lessons = this._lessons.asReadonly();

  public loadAll(): Observable<PaginatedList<TeacherLesson>> {
    return this.http
      .get<PaginatedList<TeacherLesson>>(`${environment.apiUrl}/Teachers/lessons`)
      .pipe(tap((result) => this._lessons.set(result.items ?? [])));
  }

  public toggleStatus(id: number): void {
    this._lessons.update((current) => {
      const lesson = current.find((l) => l.id === id);
      if (!lesson || lesson.status === 'drafted') return current;

      const next: LessonStatus = lesson.status === 'hidden' ? 'active' : 'hidden';
      const previousStatus = lesson.status;
      const optimistic = current.map((l) => (l.id === id ? { ...l, status: next } : l));

      this.http.patch(`${environment.apiUrl}/Lessons/${id}/toggle-status`, {}).subscribe({
        next: () => {
          // toast.success(`Lesson "${lesson.name}" is now ${next}.`);
          toast.success(`تم تغيير حالة الدرس "${lesson.name}" إلى ${next}.`);
        },
        error: () => {
          this._lessons.update((state) =>
            state.map((l) => (l.id === id ? { ...l, status: previousStatus } : l)),
          );
        },
      });

      return optimistic;
    });
  }

  public deleteLesson(id: number) {
    return this.http
      .delete(`${environment.apiUrl}/Lessons/${id}`)
      .pipe(tap(() => this._lessons.update((state) => state.filter((l) => l.id !== id))));
  }

  public filter(query: string, status: string): TeacherLesson[] {
    const q = query.trim().toLowerCase();
    return this._lessons().filter((l) => {
      const matchQ = !q || l.name.includes(q);
      const matchS = status === 'all' || l.status === status;
      return matchQ && matchS;
    });
  }
}
