import { inject, Service, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LessonStatus, TeacherLesson } from '../Models/Teacher/Teacherlesson.model';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment';

@Service()
export class TeacherLessonsService {
  private http = inject(HttpClient);

  private readonly _lessons = signal<TeacherLesson[]>([]);

  /** Expose as readonly signal */
  readonly lessons = this._lessons.asReadonly();

  loadAll(): Observable<ApiResponse<TeacherLesson[]>> {
    return this.http
      .get<ApiResponse<TeacherLesson[]>>(`${environment.apiUrl}/Teachers/lessons`)
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

  filter(query: string, status: string): TeacherLesson[] {
    const q = query.trim().toLowerCase();
    return this._lessons().filter((l) => {
      const matchQ = !q || l.name.includes(q);
      const matchS = status === 'all' || l.status === status;
      return matchQ && matchS;
    });
  }
}
