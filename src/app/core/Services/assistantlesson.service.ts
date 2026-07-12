import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment';
import { LessonStatus, AssistantLessonDto } from '../Models/Assistant/assistant-lesson.model';

@Injectable({ providedIn: 'root' })
export class AssistantLessonsService {
  private http = inject(HttpClient);

  private lessonsSubject = new BehaviorSubject<AssistantLessonDto[]>([]);
  lessons$ = this.lessonsSubject.asObservable();

  loadAll(): Observable<ApiResponse<AssistantLessonDto[]>> {
    return this.http
      .get<ApiResponse<AssistantLessonDto[]>>(`${environment.apiUrl}/Assistants/lessons`)
      .pipe(tap((response) => this.lessonsSubject.next(response.data ?? [])));
  }

  toggleStatus(id: number): void {
    const current = this.lessonsSubject.getValue();
    const lesson = current.find((l) => l.id === id);
    if (!lesson) return;
    if (lesson.status === 'drafted') return;

    const next: LessonStatus = lesson.status === 'hidden' ? 'active' : 'hidden';
    const optimistic = current.map((l) => (l.id === id ? { ...l, status: next } : l));
    this.lessonsSubject.next(optimistic);

    this.http
      .patch<ApiResponse<string>>(`${environment.apiUrl}/Lessons/toggle-status/${id}`, {})
      .subscribe({
        error: () => {
          const rolledBack = this.lessonsSubject
            .getValue()
            .map((l) => (l.id === id ? { ...l, status: lesson.status } : l));
          this.lessonsSubject.next(rolledBack);
        },
      });
  }
  delete(id: number): void {
    this.lessonsSubject.next(this.lessonsSubject.getValue().filter((l) => l.id !== id));
  }
  deleteLesson(id: number): Observable<ApiResponse<null>> {
    return this.http
      .delete<ApiResponse<null>>(`${environment.apiUrl}/Lessons/${id}`)
      .pipe(tap(() => this.delete(id)));
  }
}
