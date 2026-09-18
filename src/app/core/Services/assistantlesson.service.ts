import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssistantLessonDto, LessonStatus } from '../Models/Assistant/assistant-lesson.model';

@Service()
export class AssistantLessonsService {
  private http = inject(HttpClient);

  private readonly _lessons = signal<AssistantLessonDto[]>([]);

  /** Expose as readonly signal */
  public readonly lessons = this._lessons.asReadonly();

  public loadAll(): Observable<AssistantLessonDto[]> {
    return this.http
      .get<AssistantLessonDto[]>(`${environment.apiUrl}/Assistants/lessons`)
      .pipe(tap((lessons) => this._lessons.set(lessons ?? [])));
  }

  public toggleStatus(id: number): void {
    this._lessons.update((current) => {
      const lesson = current.find((l) => l.id === id);
      if (!lesson || lesson.status === 'drafted') return current;

      const next: LessonStatus = lesson.status === 'hidden' ? 'active' : 'hidden';
      const previousStatus = lesson.status;
      const optimistic = current.map((l) => (l.id === id ? { ...l, status: next } : l));

      this.http.patch<void>(`${environment.apiUrl}/Lessons/toggle-status/${id}`, {}).subscribe({
        error: () => {
          this._lessons.update((state) =>
            state.map((l) => (l.id === id ? { ...l, status: previousStatus } : l)),
          );
        },
      });

      return optimistic;
    });
  }

  public deleteLesson(id: number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/Lessons/${id}`)
      .pipe(tap(() => this._lessons.update((state) => state.filter((l) => l.id !== id))));
  }
}
