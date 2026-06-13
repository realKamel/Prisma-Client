import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LessonResponse } from '../Models/lesson.model';
import { ApiResponse } from '../Models/ApiResponse';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private http = inject(HttpClient);
  private apiUrl = 'lesson-data.json';
  
  // المتغير الذي سيحمل بيانات الدرس
  currentLesson: LessonResponse | null = null;

  getLessonDetails(): Observable<ApiResponse<LessonResponse>> {
    return this.http.get<ApiResponse<LessonResponse>>(this.apiUrl).pipe(
      tap(response => {
        if (response.data) {
          this.currentLesson = response.data;
        }
      })
    );
  }
}