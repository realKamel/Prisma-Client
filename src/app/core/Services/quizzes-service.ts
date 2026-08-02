import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuizListItem, StudentQuizzesResponse } from '../Models/quiz-model';

@Service()
export class QuizzesService {
  private http = inject(HttpClient);

  private readonly VARIANTS = ['pp-optics', 'pp-atom', 'pp-energy', 'pp-magnet', 'pp-thermo'];
  private readonly ICONS = ['eye', 'atom', 'bolt', 'magnet', 'thermo'];

  getStudentQuizzes(filter?: string): Observable<StudentQuizzesResponse> {
    const params: Record<string, string> = {};
    if (filter && filter !== 'all') {
      params['filter'] = filter;
    }

    return this.http
      .get<StudentQuizzesResponse>(`${environment.apiUrl}/student/quizzes`, { params })
      .pipe(
        map((res) => ({
          ...res,
          items: res.items.map((item) => this.assignUIProps(item)),
        })),
      );
  }

  private assignUIProps(item: QuizListItem): QuizListItem {
    const i = item.quizId % this.VARIANTS.length;
    return {
      ...item,
      posterVariant: this.VARIANTS[i],
      iconType: this.ICONS[i],
    };
  }
}
