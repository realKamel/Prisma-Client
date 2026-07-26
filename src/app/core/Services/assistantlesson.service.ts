import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment';
import { LessonStatus, AssistantLessonDto } from '../Models/Assistant/assistant-lesson.model';

@Service()
export class AssistantLessonsService {
  private http = inject(HttpClient);

  private readonly _lessons = signal<AssistantLessonDto[]>([]);

  /** Expose as readonly signal */
  readonly lessons = this._lessons.asReadonly();

  loadAll(): Observable<ApiResponse<AssistantLessonDto[]>> {
    return this.http
      .get<ApiResponse<AssistantLessonDto[]>>(`${environment.apiUrl}/Assistants/lessons`)
      .pipe(tap((response) => this._lessons.set(response.data ?? [])));
  }

  toggleStatus(id: number): void {
    this._lessons.update((current) => {
      const lesson = current.find((l) => l.id === id);
      if (!lesson || lesson.status === 'drafted') return current;

      const next: LessonStatus = lesson.status === 'hidden' ? 'active' : 'hidden';
      const previousStatus = lesson.status;
      const optimistic = current.map((l) => (l.id === id ? { ...l, status: next } : l));

      this.http
        .patch<ApiResponse<string>>(`${environment.apiUrl}/Lessons/toggle-status/${id}`, {})
        .subscribe({
          error: () => {
            this._lessons.update((state) =>
              state.map((l) => (l.id === id ? { ...l, status: previousStatus } : l)),
            );
          },
        });

      return optimistic;
    });
  }

  deleteLesson(id: number): Observable<ApiResponse<null>> {
    return this.http
      .delete<ApiResponse<null>>(`${environment.apiUrl}/Lessons/${id}`)
      .pipe(tap(() => this._lessons.update((state) => state.filter((l) => l.id !== id))));
  }
}
