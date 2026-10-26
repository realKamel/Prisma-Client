import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import {
  ChangePasswordPayload,
  GradeOption,
  StudentProfile,
} from '../../../models/student-profile.model';

@Service()
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly _profile = signal<StudentProfile | null>(null);
  private readonly _gradeOptions = signal<GradeOption[]>([]);

  public readonly profile = this._profile.asReadonly();
  public readonly gradeOptions = this._gradeOptions.asReadonly();

  public loadProfile(): Observable<StudentProfile> {
    return this.http
      .get<StudentProfile>(`${this.baseUrl}/Students/profile`)
      .pipe(tap((profile) => this._profile.set(profile)));
  }

  public loadGradeOptions(): Observable<GradeOption[]> {
    return this.http
      .get<GradeOption[]>(`${this.baseUrl}/Grades/grade-options`)
      .pipe(tap((options) => this._gradeOptions.set(options)));
  }

  public updateProfile(profile: StudentProfile): Observable<StudentProfile> {
    return this.http
      .put<StudentProfile>(`${this.baseUrl}/Students/profile`, profile)
      .pipe(tap((updated) => this._profile.set(updated)));
  }

  public changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Students/change-password`, payload);
  }
}
