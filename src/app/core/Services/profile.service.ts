import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  StudentProfile,
  GradeOption,
  ChangePasswordPayload,
} from '../Models/Student/student-profile.model';

@Service()
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly _profile = signal<StudentProfile | null>(null);
  private readonly _gradeOptions = signal<GradeOption[]>([]);

  readonly profile = this._profile.asReadonly();
  readonly gradeOptions = this._gradeOptions.asReadonly();

  loadProfile(): Observable<StudentProfile> {
    return this.http
      .get<StudentProfile>(`${this.baseUrl}/Students/profile`)
      .pipe(tap((profile) => this._profile.set(profile)));
  }

  loadGradeOptions(): Observable<GradeOption[]> {
    return this.http
      .get<GradeOption[]>(`${this.baseUrl}/Grades/grade-options`)
      .pipe(tap((options) => this._gradeOptions.set(options)));
  }

  updateProfile(profile: StudentProfile): Observable<StudentProfile> {
    return this.http
      .put<StudentProfile>(`${this.baseUrl}/Students/profile`, profile)
      .pipe(tap((updated) => this._profile.set(updated)));
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Students/change-password`, payload);
  }
}
