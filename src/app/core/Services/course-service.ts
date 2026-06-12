import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Course, STATIC_COURSES } from '../Models/course.model';

@Injectable({ providedIn: 'root' })
export class CourseService {
    // Change this to your actual .NET API URL
    //private apiUrl = 'https://localhost:7109/api/courses';

    //constructor(private http: HttpClient) { }

    getCourses(): Observable<Course[]> {
        return of(STATIC_COURSES);

        // return this.http.get<Course[]>(this.apiUrl).pipe(
        //     map(courses => courses.length > 0 ? courses : STATIC_COURSES),
        //     catchError(error => {
        //         console.error('Backend error, falling back to static data', error);
        //         return of(STATIC_COURSES);
        //     })
        // );
    }
}