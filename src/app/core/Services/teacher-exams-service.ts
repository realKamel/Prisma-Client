import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  AcademicYear,
  AssignmentRow,
  ExamCreatePayload,
  ExamRow,
  GradeSavedEvent,
  Lesson,
  SubmissionRow,
} from './../Models/Teacher/teacher-exams-model';
import {
  generateMockAssignments,
  generateMockExams,
  generateMockSubmissions,
  MOCK_ACADEMIC_YEARS,
  MOCK_LESSONS,
} from './../stores/exam-mock-data/exam-mock-data';

const USE_STATIC = true; // ← flip to false once backend is ready

@Injectable({ providedIn: 'root' })
export class TeacherExamsService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/teacher';

  // ── Academic years ────────────────────────────────────

  getAcademicYears(): Observable<AcademicYear[]> {
    if (USE_STATIC) return of(MOCK_ACADEMIC_YEARS);
    return this.http
      .get<AcademicYear[]>(`${this.base}/academic-years`)
      .pipe(catchError(() => of(MOCK_ACADEMIC_YEARS)));
  }

  // ── Lessons ───────────────────────────────────────────

  getLessons(): Observable<Lesson[]> {
    if (USE_STATIC) return of(MOCK_LESSONS);
    return this.http
      .get<Lesson[]>(`${this.base}/lessons`)
      .pipe(catchError(() => of(MOCK_LESSONS)));
  }

  // ── Exams ────────────────────────────────────────────

  getExams(): Observable<ExamRow[]> {
    if (USE_STATIC) return of(generateMockExams(4));
    return this.http
      .get<ExamRow[]>(`${this.base}/exams`)
      .pipe(catchError(() => of(generateMockExams(4))));
  }

  createExam(payload: ExamCreatePayload): Observable<ExamRow> {
    if (USE_STATIC) {
      const mock: ExamRow = {
        id: Date.now(),
        title: payload.title,
        date: 'النهارده',
        students: 28,
        pending: 28,
        avg: null,
        status: 'sent',
      };
      return of(mock);
    }
    return this.http
      .post<ExamRow>(`${this.base}/exams`, payload)
      .pipe(catchError(() => of({} as ExamRow)));
  }

  deleteExam(id: number): Observable<void> {
    if (USE_STATIC) return of(undefined);
    return this.http
      .delete<void>(`${this.base}/exams/${id}`)
      .pipe(catchError(() => of(undefined)));
  }

  // ── Quiz submissions ──────────────────────────────────

  getQuizSubmissions(): Observable<SubmissionRow[]> {
    if (USE_STATIC) return of(generateMockSubmissions(6, 'quiz'));
    return this.http
      .get<SubmissionRow[]>(`${this.base}/quiz-submissions`)
      .pipe(catchError(() => of(generateMockSubmissions(6, 'quiz'))));
  }

  // ── Exam result submissions ───────────────────────────

  getExamSubmissions(): Observable<SubmissionRow[]> {
    if (USE_STATIC) return of(generateMockSubmissions(5, 'exam'));
    return this.http
      .get<SubmissionRow[]>(`${this.base}/exam-submissions`)
      .pipe(catchError(() => of(generateMockSubmissions(5, 'exam'))));
  }

  // ── Assignments ───────────────────────────────────────

  getAssignments(): Observable<AssignmentRow[]> {
    if (USE_STATIC) return of(generateMockAssignments(5));
    return this.http
      .get<AssignmentRow[]>(`${this.base}/assignments`)
      .pipe(catchError(() => of(generateMockAssignments(5))));
  }

  // ── Grading ───────────────────────────────────────────

  saveGrade(event: GradeSavedEvent): Observable<void> {
    if (USE_STATIC) return of(undefined);

    const endpoints: Record<string, string> = {
      quiz:   `${this.base}/quiz-submissions/${event.id}/grade`,
      exam:   `${this.base}/exam-submissions/${event.id}/grade`,
      assign: `${this.base}/assignments/${event.id}/grade`,
    };

    return this.http
      .patch<void>(endpoints[event.category], { score: event.score })
      .pipe(catchError(() => of(undefined)));
  }
}