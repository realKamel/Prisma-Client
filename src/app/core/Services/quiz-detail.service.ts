import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  QuizResult,
  QuizTaking,
  SaveAnswerRequest,
  SubmitQuizResponse,
} from '../Models/quiz-detail.model';
import { environment } from '../../../environments/environment';

@Service()
export class QuizDetailService {
  private http = inject(HttpClient);

  getQuizTaking(quizId: number): Observable<QuizTaking> {
    return this.http.get<QuizTaking>(`${environment.apiUrl}/student/quizzes/${quizId}`);
  }

  saveAnswer(attemptId: number, body: SaveAnswerRequest): Observable<void> {
    return this.http.patch<void>(
      `${environment.apiUrl}/student/quizzes/attempts/${attemptId}/answer`,
      body,
    );
  }

  submitQuiz(attemptId: number): Observable<SubmitQuizResponse> {
    return this.http.post<SubmitQuizResponse>(
      `${environment.apiUrl}/student/quizzes/attempts/${attemptId}/submit`,
      {},
    );
  }

  getQuizResult(quizId: number): Observable<QuizResult> {
    return this.http.get<QuizResult>(`${environment.apiUrl}/student/quizzes/${quizId}/result`);
  }

  reportSecurityEvent(attemptId: number, eventType: SecurityEventType): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/student/quizzes/attempts/${attemptId}/security-event`,
      {
        eventType,
      },
    );
  }
}

export type SecurityEventType = 'TabSwitch' | 'CopyPasteAttempt';
