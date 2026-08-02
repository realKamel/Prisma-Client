import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AcademicYear,
  Lesson,
  QuizCreatePayload,
  QuizListItem,
  GradingListResponse,
  GradingAttemptDetail,
  GradeSubmitPayload,
  GradeResultDto,
  TeacherQuizzesListResponse,
} from './../Models/Teacher/teacher-exams-model';
import { environment } from '../../../environments/environment';

@Service()
export class TeacherExamsService {
  private readonly http = inject(HttpClient);

  // ── Lookups ───────────────────────────────────────────

  getAcademicYears(): Observable<AcademicYear[]> {
    return this.http.get<AcademicYear[]>(`${environment.apiUrl}/teacher/quizzes/academic-years`);
  }

  getLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${environment.apiUrl}/teacher/quizzes/available-lessons`);
  }

  // ── Quizzes ───────────────────────────────────────────

  getQuizzes(
    scope: number,
    search?: string,
    status?: string,
    page = 1,
  ): Observable<TeacherQuizzesListResponse> {
    let params = new HttpParams()
      .set('scope', scope.toString())
      .set('page', page.toString())
      .set('pageSize', '20');

    if (search?.trim()) params = params.set('search', search.trim());
    if (status && status !== 'all') params = params.set('status', status);

    return this.http.get<TeacherQuizzesListResponse>(`${environment.apiUrl}/teacher/quizzes`, {
      params,
    });
  }

  createQuiz(payload: QuizCreatePayload): Observable<QuizListItem> {
    return this.http.post<QuizListItem>(`${environment.apiUrl}/teacher/quizzes`, payload);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/teacher/quizzes/${id}`);
  }

  getGradingList(
    scope: number,
    page = 1,
    search?: string,
    status?: string,
    quizId?: number,
  ): Observable<GradingListResponse> {
    let params = new HttpParams()
      .set('scope', scope.toString())
      .set('page', page.toString())
      .set('pageSize', '20');
    if (quizId) params = params.set('quizId', quizId);

    if (search?.trim()) params = params.set('search', search.trim());
    if (status && status !== 'all') params = params.set('status', status);

    return this.http.get<GradingListResponse>(`${environment.apiUrl}/teacher/grading`, { params });
  }

  getGradingAttempt(attemptId: number): Observable<GradingAttemptDetail> {
    return this.http.get<GradingAttemptDetail>(
      `${environment.apiUrl}/teacher/grading/${attemptId}`,
    );
  }

  submitGrade(attemptId: number, payload: GradeSubmitPayload): Observable<GradeResultDto> {
    return this.http.post<GradeResultDto>(
      `${environment.apiUrl}/teacher/grading/${attemptId}/grade`,
      payload,
    );
  }

  overrideScore(attemptId: number, penaltyScore: number): Observable<{ finalScore: number }> {
    return this.http.patch<{ finalScore: number }>(
      `${environment.apiUrl}/teacher/grading/${attemptId}/override-score`,
      { penaltyScore },
    );
  }
}
