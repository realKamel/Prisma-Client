import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LessonResponse } from '../Models/lesson.model';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment';
import { LessonApiResponse } from '../Models/lesson-expired';
import { LessonPlayerResult } from '../Models/Lesson/Lesson-Player';



@Injectable({ providedIn: 'root' })
export class LessonService {
  private http = inject(HttpClient);
  // ── Current Lesson ─────────────────────────────────────────────────────────
  private _currentLesson: LessonResponse | null = null;

  get currentLesson(): LessonResponse | null {
    if (!this._currentLesson) {
      const stored = sessionStorage.getItem('currentLesson');
      if (stored) {
        try { this._currentLesson = JSON.parse(stored); } catch { }
      }
    }
    return this._currentLesson;
  }

  set currentLesson(lesson: LessonResponse | null) {
    this._currentLesson = lesson;
    if (lesson) {
      sessionStorage.setItem('currentLesson', JSON.stringify(lesson));
    } else {
      sessionStorage.removeItem('currentLesson');
    }
  }

  // ── Lesson Details (player) ────────────────────────────────────────────────
  lessonDetails: any | null = null;

  // ── API Calls ──────────────────────────────────────────────────────────────
  getLessonDetails(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<LessonResponse>>(`${environment.apiUrl}/Lessons/details/${id}`).pipe(
      tap(response => {
        if (response.data) {
          this.currentLesson = response.data;
        }
      })
    );
  }

  getLessonPlayerDetails(id: string): Observable<ApiResponse<LessonPlayerResult>> {
    return this.http.get<ApiResponse<LessonPlayerResult>>(`${environment.apiUrl}/Lessons/watch/${id}`).pipe(
      tap(response => {
        if (response.data) {
          this.lessonDetails = response.data;
        }
      })
    );
  }

  getLessonStatus(id: any): any {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/Lessons/status/${id}`);
  }

  getExpiredLessonDetails(id: any): Observable<ApiResponse<LessonApiResponse>> {
    return this.http.get<ApiResponse<LessonApiResponse>>(`${environment.apiUrl}/Lessons/expired-details/${id}`);
  }

  updateLesson(id: any, lesson: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/Lessons/editor/${id}`, lesson).pipe(
      catchError(err => {
        console.log(err.error);
        return throwError(() => err);
      })
    );
  }
}