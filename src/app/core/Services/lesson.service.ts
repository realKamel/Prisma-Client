import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LessonResponse } from '../Models/lesson.model';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment';
import { LessonApiResponse } from '../Models/lesson-expired';
import { LessonPlayerResult } from '../Models/Lesson/Lesson-Player';

@Service()
export class LessonService {
  private http = inject(HttpClient);
  // ── Current Lesson ─────────────────────────────────────────────────────────
  private _currentLesson: LessonResponse | null = null;

  get currentLesson(): LessonResponse | null {
    if (!this._currentLesson) {
      const stored = sessionStorage.getItem('currentLesson');
      if (stored) {
        try {
          this._currentLesson = JSON.parse(stored);
        } catch {}
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
    return this.http
      .get<ApiResponse<LessonResponse>>(`${environment.apiUrl}/Lessons/details/${id}`)
      .pipe(
        tap((response) => {
          if (response.data) {
            this.currentLesson = response.data;
          }
        }),
      );
  }

  getLessonPlayerDetails(id: string): Observable<ApiResponse<LessonPlayerResult>> {
    return this.http
      .get<ApiResponse<LessonPlayerResult>>(`${environment.apiUrl}/Lessons/watch/${id}`)
      .pipe(
        tap((response) => {
          if (response.data) {
            this.lessonDetails = response.data;
          }
        }),
      );
  }

  getLessonStatus(id: any): any {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/Lessons/status/${id}`);
  }

  getExpiredLessonDetails(id: any): Observable<ApiResponse<LessonApiResponse>> {
    return this.http.get<ApiResponse<LessonApiResponse>>(
      `${environment.apiUrl}/Lessons/expired-details/${id}`,
    );
  }

  // قبل كده كانت بتاخد object (lesson: any) وتبعته JSON.
  // دلوقتي بتاخد FormData عشان يقدر يحمل الملف الحقيقي (assignmentFile) جنب باقي بيانات الدرس.
  // ملحوظة: متحطيش Content-Type يدوي هنا — الـ HttpClient بيحدد multipart/form-data
  // والـ boundary الصح تلقائي لما الـ body يكون FormData.
  updateLesson(id: any, formData: FormData): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/Lessons/editor/${id}`, formData);
  }

  getLessonEditDetails(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/Lessons/editor/${id}`);
  }

  addLesson(formData: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/Lessons/add`, formData);
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
  getLessonFormOptions(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/Lessons/options`);
  }
  submitAssignment(lessonId: number, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post(`${environment.apiUrl}/lessons/${lessonId}/assignment/submit`, fd);
  }
  deleteSubmission(lessonId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/lessons/${lessonId}/assignment/submission`);
  }
}
