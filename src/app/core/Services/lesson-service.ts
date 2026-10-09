import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Lesson } from '../Models/lesson-model';
import { PaginatedList } from '../Models/paged-result.model';
import { IProblemDetails } from '../Models/problemDetails';

@Service()
export class LessonService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Students/catalog`;
  public getLessonsCatalog(): Observable<PaginatedList<Lesson>> {
    return this.http.get<PaginatedList<Lesson>>(this.apiUrl).pipe(
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
