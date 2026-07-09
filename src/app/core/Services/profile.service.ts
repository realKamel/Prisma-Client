import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  StudentProfile,
  GradeOption,
  ChangePasswordPayload,
} from '../Models/Student/student-profile.model';

interface Result<T> {
  succeeded: boolean;
  data: T;
  meta?: unknown;
  message?: string;
  errors?: string[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly profileSubject = new BehaviorSubject<StudentProfile | null>(null);
  private readonly gradeOptionsSubject = new BehaviorSubject<GradeOption[]>([]);

  readonly profile$ = this.profileSubject.asObservable();
  readonly gradeOptions$ = this.gradeOptionsSubject.asObservable();

  loadProfile(): Observable<StudentProfile> {
    return this.http.get<Result<StudentProfile>>(`${this.baseUrl}/Students/profile`).pipe(
      map((response) => response.data),
      tap((profile) => this.profileSubject.next(profile)),
    );
  }

  loadGradeOptions(): Observable<GradeOption[]> {
    return this.http.get<Result<GradeOption[]>>(`${this.baseUrl}/Grades/grade-options`).pipe(
      map((response) => response.data),
      tap((options) => this.gradeOptionsSubject.next(options)),
    );
  }

  updateProfile(profile: StudentProfile): Observable<StudentProfile> {
    return this.http.put<Result<StudentProfile>>(`${this.baseUrl}/Students/profile`, profile).pipe(
      map((response) => response.data),
      tap((updated) => this.profileSubject.next(updated)),
    );
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Students/change-password`, payload);
  }
}
