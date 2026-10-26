import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PaginatedList } from '../../../shared/models/paged-result.model';
import { LessonStatus, TeacherLesson } from '../models/Teacherlesson.model';

/**
 * Teacher-facing lessons API service: lists the signed-in teacher's own
 * lessons and lets them toggle visibility or delete a lesson.
 */
@Service()
export class TeacherLessonsService {
  private readonly http = inject(HttpClient);
  private readonly _lessons = signal<TeacherLesson[]>([]);

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
