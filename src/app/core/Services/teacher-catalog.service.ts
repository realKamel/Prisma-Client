import { Service, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IProblemDetails } from '../Models/problemDetails';
import { environment } from '../../../environments/environment';
import { Teacher } from '../Models/Student/teacher.model';
import { TeacherLesson } from '../Models/Student/teacher-lesson.model';
import { TeacherProfile } from '../Models/Student/teacher-profile.model';
import { PagedResult } from '../Models/paged-result.model';

/**
 * Student-facing teacher catalog API service.
 * Fetches the paged list of teachers shown on the student "Teachers" page,
 * the single-teacher profile detail page, and a teacher's lesson catalog.
 */
@Service()
export class TeacherCatalogService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/students/teachers`;

  getTeachers(pageNumber = 1, pageSize = 9, search = ''): Observable<PagedResult<Teacher>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PagedResult<Teacher>>(this.apiUrl, { params }).pipe(
      catchError((err: HttpErrorResponse) => {
        const problem = err.error as IProblemDetails | undefined;
        console.error(
          '[TeacherCatalogService] HTTP error:',
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

  /** Fetches the full public profile of a single teacher. */
  getTeacherProfile(id: string): Observable<TeacherProfile> {
    return this.http.get<TeacherProfile>(`${environment.apiUrl}/teachers/${id}/profile`);
  }

  /** Fetches the paged, searchable lesson catalog of a single teacher. */
  getTeacherLessons(
    teacherId: string,
    pageNumber = 1,
    pageSize = 10,
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
            '[TeacherCatalogService] HTTP error:',
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
