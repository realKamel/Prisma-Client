import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResult, Lesson, STATIC_LESSONS } from '../Models/lesson-model';

@Injectable({ providedIn: 'root' })
export class LessonService {

    private readonly apiUrl = '/api/v1/Students/catalog';

    constructor(private http: HttpClient) { }

    getLessons(): Observable<Lesson[]> {
        return this.http
            .get<ApiResult<Lesson[]>>(this.apiUrl)
            .pipe(
                map(res => {
                    if (!res?.succeeded || !Array.isArray(res.data) || res.data.length === 0) {
                        console.warn('[LessonService] API returned no data — falling back to static lessons');
                        return STATIC_LESSONS;
                    }
                    return res.data;
                }),
                catchError(err => {
                    console.error('[LessonService] HTTP error:', err.status, err.message);
                    return of(STATIC_LESSONS);
                }),
            );
    }
}