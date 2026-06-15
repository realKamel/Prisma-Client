import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LessonResponse } from '../Models/lesson.model';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment';

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
  getLessonPlayerDetails(id:string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/Lessons/watch/${id}`).pipe(
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
}