import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserProfile,
  CreateUserPayload,
  UpdateUserPayload,
  TeacherOption,
  GradeOption,
} from '../Models/Admin/User.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  // ── Users list (users.component) ──────────────────────────────────────────
  /**
   * Returns the full user list. Filtering/search/pagination are currently
   * done client-side in UsersComponent (see `filtered` / `paginated`
   * getters), so this simply fetches everything.
   *
   * If the user list grows large, swap this for server-side filtering by
   * accepting { search, role, status, page, pageSize } query params and
   * returning a paginated shape instead — the component's getters would
   * then just read the last response rather than re-deriving it.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getUserById(id: number | string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  deleteUser(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ── Profile page (user-profile.component) ─────────────────────────────────
  /**
   * One aggregated call that returns the user plus whichever role-specific
   * sections apply (lessons/quizzes for students, students/assistants for
   * teachers, permissions for assistants, login records for admins, etc).
   * See UserProfile in user.model.ts for the exact shape expected.
   */
  getUserProfile(id: number | string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/${id}/profile`);
  }

  /** Revokes a student's access to a lesson (the "remove" modal action). */
  removeLessonAccess(userId: number | string, lessonId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}/lessons/${lessonId}`);
  }

  // ── Create / edit form (user-form.component) ──────────────────────────────
  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload);
  }

  updateUser(id: number | string, payload: UpdateUserPayload): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, payload);
  }

  getTeacherOptions(): Observable<TeacherOption[]> {
    return this.http.get<TeacherOption[]>(`${environment.apiUrl}/teachers`, {
      params: new HttpParams().set('select', 'id,name'),
    });
  }

  getGradeOptions(): Observable<GradeOption[]> {
    return this.http.get<GradeOption[]>(`${environment.apiUrl}/grades`);
  }
}