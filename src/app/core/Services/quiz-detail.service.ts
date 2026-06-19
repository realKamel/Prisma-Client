import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import {  QuizResult, QuizTaking, SaveAnswerRequest, SubmitQuizResponse } from '../Models/quiz-detail.model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../Models/ApiResponse';

@Injectable({ providedIn: 'root' })
export class QuizDetailService {
    private http = inject(HttpClient);

    getQuizTaking(quizId: number): Observable<QuizTaking> {
    return this.http
      .get<ApiResponse<QuizTaking>>(`${environment.apiUrl}/student/quizzes/${quizId}`)
      .pipe(
        map(res => {
          if (!res.succeeded || !res.data)
            throw new Error(res.message);
          return res.data;
        })
      );
  }


  saveAnswer(attemptId: number, body: SaveAnswerRequest): Observable<void> {
    return this.http
      .patch<ApiResponse<null>>(`${environment.apiUrl}/student/quizzes/attempts/${attemptId}/answer`, body)
      .pipe(
        map(res => {
          if (!res.succeeded) throw new Error(res.message);
        })
      );
  }



  submitQuiz(attemptId: number): Observable<SubmitQuizResponse> {
    return this.http
      .post<ApiResponse<SubmitQuizResponse>>(
        `${environment.apiUrl}/student/quizzes/attempts/${attemptId}/submit`, {}
      )
      .pipe(
        map(res => {
          if (!res.succeeded || !res.data)
            throw new Error(res.message);
          return res.data;
        })
      );
  }


  getQuizResult(quizId: number): Observable<QuizResult> {
    return this.http
      .get<ApiResponse<QuizResult>>(`${environment.apiUrl}/student/quizzes/${quizId}/result`)
      .pipe(
        map(res => {
          if (!res.succeeded || !res.data)
            throw new Error(res.message);
          return res.data;
        })
      );
  }
}
