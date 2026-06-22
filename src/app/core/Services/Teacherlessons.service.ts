
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LessonStatus, TeacherLesson } from '../Models/Teacher/Teacherlesson.model';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeacherLessonsService {
  private http = inject(HttpClient);

  private lessonsSubject = new BehaviorSubject<TeacherLesson[]>([]);
  lessons$ = this.lessonsSubject.asObservable();

 

  loadAll(): Observable<ApiResponse<TeacherLesson[]>> {
    return this.http
      .get<ApiResponse<TeacherLesson[]>>(`${environment.apiUrl}/Teachers/lessons`)
      .pipe(
        tap(response => this.lessonsSubject.next(response.data ?? []))
      );
  }

  toggleStatus(id: number): void {
    const lessons = this.lessonsSubject.getValue().map(l => {
      if (l.id !== id) return l;
const next: LessonStatus = l.status === 'hidden' ? 'active' : 'hidden';
      return { ...l, status: next };
    });
    this.lessonsSubject.next(lessons);
  }

  delete(id: number): void {
    this.lessonsSubject.next(
      this.lessonsSubject.getValue().filter(l => l.id !== id)
    );
  }

  filter(query: string, status: string): TeacherLesson[] {
    const q = query.trim().toLowerCase();
    return this.lessonsSubject.getValue().filter(l => {
      const matchQ = !q || l.name.includes(q);
      const matchS = status === 'all' || l.status === status;
      return matchQ && matchS;
    });
  }
}
