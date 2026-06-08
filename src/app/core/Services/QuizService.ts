import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { QuizQuestion } from "../Models/Quiz";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private http = inject(HttpClient);
  getQuiz(): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>('');
  }
}