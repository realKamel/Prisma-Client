import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LessonResponse } from '../Models/lesson.model';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment';
import { LessonApiResponse } from '../Models/lesson-expired';
import { LessonPlayerResult } from '../Models/Lesson/Lesson-Player';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private http = inject(HttpClient);
  
  // المتغير الذي سيحمل بيانات الدرس
  currentLesson: LessonResponse | null = null;
  lessonDetails: any| null = null;
  getLessonDetails(id:string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<LessonResponse>>(`${environment.apiUrl}/Lessons/details/${id}`).pipe(
      tap(response => {
        if (response.data) {
          this.currentLesson = response.data;
        }
      })
    );
  }
  getLessonPlayerDetails(id:string): Observable<ApiResponse<LessonPlayerResult>> {
    return this.http.get<ApiResponse<LessonPlayerResult>>(`${environment.apiUrl}/Lessons/watch/${id}`).pipe(
      tap(response => {
        if (response.data) {
          this.lessonDetails = response.data;
        }
      })
    );
  }
  getLessonStatus(id:any): any {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/Lessons/status/${id}`);
  }

  getExpiredLessonDetails(id:any):Observable<ApiResponse<LessonApiResponse>>{
    return this.http.get<ApiResponse<LessonApiResponse>>(`${environment.apiUrl}/Lessons/expired-details/${id}`);
  }
}