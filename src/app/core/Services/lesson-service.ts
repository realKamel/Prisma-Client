import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { IProblemDetails } from '../Models/problemDetails';
import { environment } from '../../../environments/environment';
import { Lesson } from '../Models/lesson-model';

@Service()
export class LessonService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Students/catalog`;

  getLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.apiUrl).pipe(
      catchError((err: HttpErrorResponse) => {
        const problem = err.error as IProblemDetails | undefined;
        console.error(
          '[LessonService] HTTP error:',
          err.status,
          problem?.title ?? problem?.detail ?? err.message,
        );
        return of([]);
      }),
    );
  }
}
