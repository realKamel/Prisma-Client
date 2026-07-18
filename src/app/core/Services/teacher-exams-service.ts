import { Injectable, Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
import { ApiResponse } from '../Models/ApiResponse';

@Service()
export class TeacherExamsService {
  private readonly http = inject(HttpClient);

  // ── Lookups ───────────────────────────────────────────

  getAcademicYears(): Observable<AcademicYear[]> {
    return this.http
      .get<ApiResponse<AcademicYear[]>>(`${environment.apiUrl}/teacher/quizzes/academic-years`)
      .pipe(map((res) => res.data ?? []));
  }

  getLessons(): Observable<Lesson[]> {
    return this.http
      .get<ApiResponse<Lesson[]>>(`${environment.apiUrl}/teacher/quizzes/available-lessons`)
      .pipe(map((res) => res.data ?? []));
  }

  // ── Quizzes ───────────────────────────────────────────

  getQuizzes(
    scope: number,
    search?: string,
    status?: string,
    page: number = 1,
  ): Observable<TeacherQuizzesListResponse> {
    let params = new HttpParams()
      .set('scope', scope.toString())
      .set('page', page.toString())
      .set('pageSize', '20');

    if (search?.trim()) params = params.set('search', search.trim());
    if (status && status !== 'all') params = params.set('status', status);

    return this.http
      .get<ApiResponse<TeacherQuizzesListResponse>>(`${environment.apiUrl}/teacher/quizzes`, {
        params,
      })
      .pipe(map((res) => res.data!));
  }

  createQuiz(payload: QuizCreatePayload): Observable<QuizListItem> {
    return this.http
      .post<ApiResponse<QuizListItem>>(`${environment.apiUrl}/teacher/quizzes`, payload)
      .pipe(map((res) => res.data!));
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${environment.apiUrl}/teacher/quizzes/${id}`)
      .pipe(map(() => void 0));
  }

  getGradingList(
    scope: number,
    page: number = 1,
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

    return this.http
      .get<ApiResponse<GradingListResponse>>(`${environment.apiUrl}/teacher/grading`, { params })
      .pipe(map((res) => res.data!));
  }

  getGradingAttempt(attemptId: number): Observable<GradingAttemptDetail> {
    return this.http
      .get<ApiResponse<GradingAttemptDetail>>(`${environment.apiUrl}/teacher/grading/${attemptId}`)
      .pipe(map((res) => res.data!));
  }

  submitGrade(attemptId: number, payload: GradeSubmitPayload): Observable<GradeResultDto> {
    return this.http
      .post<ApiResponse<GradeResultDto>>(
        `${environment.apiUrl}/teacher/grading/${attemptId}/grade`,
        payload,
      )
      .pipe(map((res) => res.data!));
  }

  overrideScore(attemptId: number, penaltyScore: number): Observable<{ finalScore: number }> {
    return this.http
      .patch<ApiResponse<{ finalScore: number }>>(
        `${environment.apiUrl}/teacher/grading/${attemptId}/override-score`,
        { penaltyScore },
      )
      .pipe(map((res) => res.data!));
  }
}
