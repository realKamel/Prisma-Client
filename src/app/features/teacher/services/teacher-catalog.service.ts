import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { IProblemDetails } from '../../../shared/models/problem-details';
import { TeacherLesson } from '../../student/models/teacher-lesson.model';
import { TeacherProfile } from '../../student/models/teacher-profile.model';
import { Teacher } from '../../student/models/teacher.model';

/**
 * The catalog is small (about 30 teachers at most), so it loads everything in one
 * request and the page handles search, filtering and pagination on the client.
 * Keep this comfortably above the real teacher count.
 */
const ALL_TEACHERS_PAGE_SIZE = 100;

/**
 * The signed-in student's current academic year, sent by the API
 * (same shape as a teacher's academic year). Null for anonymous users and non-students.
 */
export type StudentCurrentYear = { id: string; name: string } | null;

export interface TeachersCatalog {
  teachers: Teacher[];
  studentCurrentYear: StudentCurrentYear;
}

/** The API's paged response plus the student's year at the top level. */
type TeachersApiResponse = PagedResult<Teacher> & { studentCurrentYear?: StudentCurrentYear };

/**
 * Student-facing teacher catalog API service.
 * Fetches the teachers shown on the student "Teachers" page,
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

  /**
   * Fetches every teacher in a single request (used by the teacher catalog store).
   * Errors are logged and re-thrown so the store can expose an error state
   * (instead of the page showing a misleading "no teachers" message).
   */
  getAllTeachers(): Observable<TeachersCatalog> {
    const params = new HttpParams()
      .set('pageNumber', '1')
      .set('pageSize', String(ALL_TEACHERS_PAGE_SIZE));

    return this.http.get<TeachersApiResponse>(this.apiUrl, { params }).pipe(
      map(
        (result): TeachersCatalog => ({
          teachers: result?.items ?? [],
          studentCurrentYear: result?.studentCurrentYear ?? null,
        }),
      ),
      catchError((err: HttpErrorResponse) => {
        const problem = err.error as IProblemDetails | undefined;
        console.error(
          '[TeacherCatalogService] HTTP error:',
          err.status,
          problem?.title ?? problem?.detail ?? err.message,
        );
        return throwError(() => err);
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