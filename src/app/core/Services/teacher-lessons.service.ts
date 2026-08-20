import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IProblemDetails } from '../Models/problemDetails';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../Models/paged-result.model';
import { TeacherLesson } from '../Models/Student/teacher-lesson.model';

/**
 * Student-facing teacher lessons API service.
 * Fetches the paged, searchable lesson catalog of a single teacher
 * from `GET /students/teachers/{id}/lessons`.
 */
@Service()
export class TeacherLessonsService {
  private readonly http = inject(HttpClient);

  getTeacherLessons(
    teacherId: string,
    pageNumber = 1,
    pageSize = 9,
    keyword = '',
  ): Observable<PagedResult<TeacherLesson>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    if (keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }

    return this.http
      .get<PagedResult<TeacherLesson>>(`${environment.apiUrl}/teachers/${teacherId}/lessons`, {
        params,
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const problem = err.error as IProblemDetails | undefined;
          console.error(
            '[TeacherLessonsService] HTTP error:',
            err.status,
            problem?.title ?? problem?.detail ?? err.message,
          );
          return of({
            pageNumber: 1,
            pageSize,
            totalCount: 0,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false,
            items: [],
          });
        }),
      );
  }
}
