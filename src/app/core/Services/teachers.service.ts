import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Teacher, TeacherStats } from '../models/admin/teachers-admin.types';
import { AcademicYear } from '../models/teacher/teacher-exams-model';

@Service()
export class TeachersService {
  private http = inject(HttpClient);

  // 💡 هنا بنكتب اسم الـ Controller فقط لأن environment.apiUrl فيه بالفعل /api/v1
  private readonly API_URL = `${environment.apiUrl}/Teachers`;

  public getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.API_URL);
  }

  public getStats(): Observable<TeacherStats> {
    return this.http.get<TeacherStats>(`${this.API_URL}/stats`);
  }

  public activateTeacher(id: string): Observable<boolean> {
    return this.http.put<boolean>(`${this.API_URL}/${id}/activate`, {});
  }

  public suspendTeacher(id: string, reason?: string): Observable<boolean> {
    return this.http.put<boolean>(`${this.API_URL}/${id}/suspend`, { reason });
  }

  public getTeacherAcademicYears(): Observable<AcademicYear[]> {
    return this.http.get<AcademicYear[]>(
      `${environment.apiUrl}/AcademicYearTeacher/academic-year-options`,
    );
  }
}
