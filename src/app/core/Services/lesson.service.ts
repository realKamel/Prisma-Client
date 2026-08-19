import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LessonFormOptionsResponse, LessonResponse } from '../Models/lesson.model';
import { environment } from '../../../environments/environment';
import { LessonApiResponse } from '../Models/lesson-expired';
import { LessonPlayerResult } from '../Models/Lesson/Lesson-Player';

@Service()
export class LessonService {
  private http = inject(HttpClient);

  // ── Current Lesson ─────────────────────────────────────────────────────────
  private readonly _currentLesson = signal<LessonResponse | null>(null);

  /** Read-only signal for the current lesson */
  readonly currentLesson = this._currentLesson.asReadonly();

  /** Restore from sessionStorage on init (lazy, via a one-time check) */
  private sessionRestored = false;

  /** Set current lesson and persist to sessionStorage */
  setCurrentLesson(lesson: LessonResponse | null): void {
    this._currentLesson.set(lesson);
    if (lesson) {
      sessionStorage.setItem('currentLesson', JSON.stringify(lesson));
    } else {
      sessionStorage.removeItem('currentLesson');
    }
  }

  /** Restore lesson from sessionStorage if not already loaded */
  restoreFromSession(): LessonResponse | null {
    if (this.sessionRestored && !this._currentLesson()) return null;
    this.sessionRestored = true;
    if (!this._currentLesson()) {
      const stored = sessionStorage.getItem('currentLesson');
      if (stored) {
        try {
          const lesson = JSON.parse(stored) as LessonResponse;
          this._currentLesson.set(lesson);
          return lesson;
        } catch {
          console.warn('Failed to parse currentLesson from sessionStorage');
        }
      }
    }
    return this._currentLesson();
  }

  // ── Lesson Details (player) ────────────────────────────────────────────────
  private readonly _lessonDetails = signal<any>(null);

  /** Read-only signal for lesson player details */
  readonly lessonDetails = this._lessonDetails.asReadonly();

  setLessonDetails(details: any): void {
    this._lessonDetails.set(details);
  }

  // ── API Calls ──────────────────────────────────────────────────────────────
  getLessonDetails(id: string): Observable<LessonResponse> {
    return this.http.get<LessonResponse>(`${environment.apiUrl}/Lessons/${id}/details`).pipe(
      tap((lesson) => {
        if (lesson) {
          this.setCurrentLesson(lesson);
        }
      }),
    );
  }

  getLessonPlayerDetails(id: string): Observable<LessonPlayerResult> {
    return this.http.get<LessonPlayerResult>(`${environment.apiUrl}/Lessons/${id}/watch`).pipe(
      tap((lesson) => {
        if (lesson) {
          this.setLessonDetails(lesson);
        }
      }),
    );
  }

  getLessonStatus(id: any): Observable<{ status: number }> {
    return this.http.get<{ status: number }>(`${environment.apiUrl}/Lessons/${id}/status`);
  }

  getExpiredLessonDetails(id: any): Observable<LessonApiResponse> {
    return this.http.get<LessonApiResponse>(`${environment.apiUrl}/Lessons/${id}/expired-details`);
  }

  // قبل كده كانت بتاخد object (lesson: any) وتبعته JSON.
  // دلوقتي بتاخد FormData عشان يقدر يحمل الملف الحقيقي (assignmentFile) جنب باقي بيانات الدرس.
  // ملحوظة: متحطيش Content-Type يدوي هنا — الـ HttpClient بيحدد multipart/form-data
  // والـ boundary الصح تلقائي لما الـ body يكون FormData.
  updateLesson(id: any, formData: FormData): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/Lessons/${id}/editor`, formData);
  }

  getLessonEditDetails(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Lessons/${id}/editor`);
  }

  addLesson(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/Lessons`, formData);
  }

  getVideoUploadUrl(sectionId: number): Observable<{ uploadUrl: string; uploadId: string }> {
    return this.http.get<{ uploadUrl: string; uploadId: string }>(
      `${environment.apiUrl}/videoStorage/upload-url`,
      {
        params: { sectionId },
      },
    );
  }
  startSectionProgress(sectionId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/sectionProgress/${sectionId}/progress/start`,
      {},
    );
  }

  saveSectionProgress(sectionId: number, watchedSeconds: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/sectionProgress/${sectionId}/progress`, {
      watchedSeconds,
    });
  }

  completeSectionProgress(sectionId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/sectionProgress/${sectionId}/progress/complete`,
      {},
    );
  }
  getLessonFormOptions(): Observable<LessonFormOptionsResponse> {
    return this.http.get<LessonFormOptionsResponse>(`${environment.apiUrl}/Lessons/options`);
  }
  submitAssignment(lessonId: number, file: File): Observable<unknown> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post(`${environment.apiUrl}/lessons/${lessonId}/assignments`, fd);
  }
  deleteSubmission(lessonId: number): Observable<unknown> {
    return this.http.delete(`${environment.apiUrl}/lessons/${lessonId}/assignments/submission`);
  }
}
