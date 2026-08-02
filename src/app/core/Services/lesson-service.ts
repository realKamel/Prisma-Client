import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { IProblemDetails } from '../Models/problemDetails';
import { Lesson, STATIC_LESSONS } from '../Models/lesson-model';
import { environment } from '../../../environments/environment';

@Service()
export class LessonService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Students/catalog`;

  getLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.apiUrl).pipe(
      map((res) => {
        if (!Array.isArray(res) || res.length === 0) {
          console.warn('[LessonService] API returned no data — falling back to static lessons');
          return STATIC_LESSONS;
        }
        return res;
      }),
      catchError((err: HttpErrorResponse) => {
        const problem = err.error as IProblemDetails | undefined;
        console.error(
          '[LessonService] HTTP error:',
          err.status,
          problem?.title ?? problem?.detail ?? err.message,
        );
        return of(STATIC_LESSONS);
      }),
    );
  }
}
