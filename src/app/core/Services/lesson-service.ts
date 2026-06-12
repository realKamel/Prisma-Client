import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Lesson, STATIC_LESSONS } from '../Models/lesson-model';

@Injectable({ providedIn: 'root' })
export class LessonService {
    // Change this to your actual .NET API URL
    //private apiUrl = 'https://localhost:7109/api/lessons';

    //constructor(private http: HttpClient) { }

    getLessons(): Observable<Lesson[]> {
        return of(STATIC_LESSONS);

        // return this.http.get<Lesson[]>(this.apiUrl).pipe(
        //     map(lessons => lessons.length > 0 ? lessons : STATIC_LESSONS),
        //     catchError(error => {
        //         console.error('Backend error, falling back to static data', error);
        //         return of(STATIC_LESSONS);
        //     })
        // );
    }
}