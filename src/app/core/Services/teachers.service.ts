import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Teacher, TeacherStats } from '../Models/Admin/teachers-admin.types';

@Injectable({ providedIn: 'root' })
export class TeachersService {
  private http = inject(HttpClient);
  
  // 💡 هنا بنكتب اسم الـ Controller فقط لأن environment.apiUrl فيه بالفعل /api/v1
  private readonly API_URL = `${environment.apiUrl}/Teachers`;

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.API_URL);
  }

  getStats(): Observable<TeacherStats> {
    return this.http.get<TeacherStats>(`${this.API_URL}/stats`);
  }

  activateTeacher(id: string): Observable<boolean> {
    return this.http.put<boolean>(`${this.API_URL}/${id}/activate`, {});
  }

  suspendTeacher(id: string, reason?: string): Observable<boolean> {
    return this.http.put<boolean>(`${this.API_URL}/${id}/suspend`, { reason });
  }
}