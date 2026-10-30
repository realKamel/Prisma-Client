import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedList } from '../../../shared/models/paged-result.model';
import { IProblemDetails } from '../../../shared/models/problem-details';
import { AssignmentSubmission, LessonPlayerResult } from '../models/Lesson-player.model';
import { LessonApiResponse } from '../models/lesson-expired';
import {
  AddLessonRequest,
  AddLessonResponse,
  CreateLessonResponse,
  CreateLessonSectionRequest,
  CreateLessonSectionResponse,
  Lesson,
  LessonEditDetails,
  LessonFormOptionsResponse,
  LessonResponse,
  RenewSectionUploadLinkResponse,
  StudentEnrollmentStatus,
  UpdateLessonResponse,
} from '../models/lesson.model';
@Service()
export class LessonService {
  private http = inject(HttpClient);

  private readonly _currentLesson = signal<LessonResponse | null>(null);
  public readonly isLoading = signal<boolean>(false);
  /** Read-only signal for the current lesson */
  public readonly currentLesson = this._currentLesson.asReadonly();

  /** Restore from sessionStorage on init (lazy, via a one-time check) */
  private sessionRestored = false;

  /** Set current lesson and persist to sessionStorage */
  public setCurrentLesson(lesson: LessonResponse | null): void {
    this._currentLesson.set(lesson);
    if (lesson) {
      sessionStorage.setItem('currentLesson', JSON.stringify(lesson));
    } else {
      sessionStorage.removeItem('currentLesson');
    }
  }

  /** Restore lesson from sessionStorage if not already loaded */
  public restoreFromSession(): LessonResponse | null {
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
  private readonly _lessonDetails = signal<LessonPlayerResult | null>(null);

  /** Read-only signal for lesson player details */
  public readonly lessonDetails = this._lessonDetails.asReadonly();

  public setLessonDetails(details: LessonPlayerResult): void {
    this._lessonDetails.set(details);
  }

  //API Calls
  public getLessonDetails(id: string): Observable<LessonResponse> {
    this.isLoading.set(true);
    return this.http.get<LessonResponse>(`${environment.apiUrl}/Lessons/${id}/details`).pipe(
      tap((lesson) => {
        if (lesson) {
          this.setCurrentLesson(lesson);
          this.isLoading.set(false);
        }
      }),
    );
  }

  public getLessonPlayerDetails(id: string): Observable<LessonPlayerResult> {
    return this.http.get<LessonPlayerResult>(`${environment.apiUrl}/Lessons/${id}/watch`).pipe(
      tap((lesson) => {
        if (lesson) {
          this.setLessonDetails(lesson);
        }
      }),
    );
  }

  public getLessonStatus(id: number | string): Observable<{ status: StudentEnrollmentStatus }> {
    return this.http.get<{ status: StudentEnrollmentStatus }>(
      `${environment.apiUrl}/Lessons/${id}/status`,
    );
  }

  public getExpiredLessonDetails(id: number | string): Observable<LessonApiResponse> {
    return this.http.get<LessonApiResponse>(`${environment.apiUrl}/Lessons/${id}/expired-details`);
  }

  public updateLesson(id: string | number, formData: FormData): Observable<UpdateLessonResponse> {
    return this.http.put<UpdateLessonResponse>(
      `${environment.apiUrl}/Lessons/${id}/editor`,
      formData,
    );
  }

  public getLessonEditDetails(id: string | number): Observable<LessonEditDetails> {
    return this.http.get<LessonEditDetails>(`${environment.apiUrl}/Lessons/${id}/editor`);
  }

  public addLesson(formData: FormData): Observable<CreateLessonResponse> {
    return this.http.post<CreateLessonResponse>(`${environment.apiUrl}/Lessons`, formData);
  }
  public addLessonV2(request: AddLessonRequest): Observable<AddLessonResponse> {
    return this.http.post<AddLessonResponse>(`${environment.apiUrl}/Lessons/v2`, request);
  }

  /**
   * Creates one lesson section together with the video it will hold, and returns the signed TUS
   * credentials needed to upload the file straight to Bunny Stream. The video is already attached
   * to the section, so uploading is the only remaining step.
   */
  public createLessonSection(
    lessonId: string,
    request: CreateLessonSectionRequest,
  ): Observable<CreateLessonSectionResponse> {
    return this.http.post<CreateLessonSectionResponse>(
      `${environment.apiUrl}/Lessons/${lessonId}/sections`,
      request,
    );
  }

  /** Re-signs the upload link of the video already attached to a section, e.g. after it expired. */
  public renewSectionVideoUploadLink(
    lessonId: string,
    sectionId: string,
    videoId: string,
  ): Observable<RenewSectionUploadLinkResponse> {
    return this.http.patch<RenewSectionUploadLinkResponse>(
      `${environment.apiUrl}/lessons/${lessonId}/sections/${sectionId}`,
      {
        videoId,
      },
    );
  }

  /**
   * Deletes one lesson section together with the video attached to it. Removing a chapter from the
   * videos step calls this so the backend stays in sync with the rows on screen.
   */
  public removeLessonSection(lessonId: string, sectionId: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/lessons/${lessonId}/sections/${sectionId}`,
    );
  }

  public getVideoUploadUrl(
    sectionId: number,
    guidId: string | undefined,
  ): Observable<{ uploadUrl: string; uploadId: string }> {
    return this.http.get<{ uploadUrl: string; uploadId: string }>(
      `${environment.apiUrl}/videoStorage/upload-url`,
      {
        params: { sectionId, guidId: guidId ?? '' },
      },
    );
  }

  public startSectionProgress(sectionId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/sectionProgress/${sectionId}/progress/start`,
      {},
    );
  }

  public saveSectionProgress(sectionId: number, watchedSeconds: number) {
    return this.http.put(`${environment.apiUrl}/sectionProgress/${sectionId}/progress`, {
      watchedSeconds,
    });
  }

  public saveSectionProgressOnUnload(sectionId: number, watchedSeconds: number): void {
    void fetch(`${environment.apiUrl}/sectionProgress/${sectionId}/progress`, {
      method: 'PUT',
      keepalive: true,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watchedSeconds }),
    }).catch(() => undefined);
  }

  public completeSectionProgress(sectionId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/sectionProgress/${sectionId}/progress/complete`,
      {},
    );
  }

  public getLessonFormOptions(): Observable<LessonFormOptionsResponse> {
    return this.http.get<LessonFormOptionsResponse>(`${environment.apiUrl}/Lessons/options`);
  }

  public getAssignmentSubmission(lessonId: number): Observable<AssignmentSubmission | null> {
    return this.http.get<AssignmentSubmission | null>(
      `${environment.apiUrl}/lessons/${lessonId}/assignment-submission`,
    );
  }

  public submitAssignment(lessonId: number, file: File): Observable<unknown> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post(`${environment.apiUrl}/lessons/${lessonId}/assignment-submission`, fd);
  }

  public deleteAssignmentSubmission(lessonId: number): Observable<unknown> {
    return this.http.delete(`${environment.apiUrl}/lessons/${lessonId}/assignment-submission`);
  }

  public getLessonsCatalog(): Observable<PaginatedList<Lesson>> {
    const apiUrl = `${environment.apiUrl}/students/catalog`;
    return this.http.get<PaginatedList<Lesson>>(apiUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        const problem = err.error as IProblemDetails | undefined;
        console.error(
          '[LessonService] HTTP error:',
          err.status,
          problem?.title ?? problem?.detail ?? err.message,
        );
        throw err;
      }),
    );
  }
}
