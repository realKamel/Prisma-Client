import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserEditData,
  CreateUserPayload,
  UpdateUserPayload,
  TeacherOption,
  GradeOption,
  Lesson,
  Activity,
  StatCard,
  StudentStatsRaw,
  RoleProfile,
} from '../Models/Admin/User.model';

@Service()
export class UserService {
  private http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly gradesUrl = `${environment.apiUrl}/grades`;
  private readonly teacherStudentsUrl = `${environment.apiUrl}/TeacherStudents`;

  // ── Users list / CRUD — backed by the new Admin-only UsersController ──────
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }

  getUserById(id: string): Observable<UserEditData> {
    return this.http.get<UserEditData>(`${this.usersUrl}/${id}`);
  }

  createUser(payload: CreateUserPayload): Observable<UserEditData> {
    return this.http.post<UserEditData>(this.usersUrl, payload);
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<UserEditData> {
    return this.http.put<UserEditData>(`${this.usersUrl}/${id}`, payload);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }

  getTeacherOptions(): Observable<TeacherOption[]> {
    return this.http.get<TeacherOption[]>(`${this.usersUrl}/teachers`);
  }

  getGradeOptions(): Observable<GradeOption[]> {
    return this.http.get<GradeOption[]>(`${this.gradesUrl}/grade-options`);
  }

  getTeacherProfile(id: string): Observable<RoleProfile> {
    return this.http.get<RoleProfile>(`${this.usersUrl}/${id}/teacher-dashboard`);
  }

  getAssistantProfile(id: string): Observable<RoleProfile> {
    return this.http.get<RoleProfile>(`${this.usersUrl}/${id}/assistant-dashboard`);
  }

  getAdminProfile(id: string): Observable<RoleProfile> {
    return this.http.get<RoleProfile>(`${this.usersUrl}/${id}/admin-dashboard`);
  }

  getStudentLessons(studentId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.teacherStudentsUrl}/${studentId}/lessons`);
  }

  getStudentActivities(studentId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.teacherStudentsUrl}/${studentId}/activities`);
  }

  getStudentStats(studentId: string): Observable<StatCard[]> {
    return this.http.get<StudentStatsRaw>(`${this.teacherStudentsUrl}/${studentId}/stats`).pipe(
      map(
        (s) =>
          [
            { label: 'الدروس', value: String(s.lessons), color: 'text-[var(--purple-lt)]' },
            { label: 'متوسط الكويزات', value: `${s.avgQuiz}٪`, color: 'text-[var(--star)]' },
            { label: 'الساعات', value: String(s.hours), color: 'text-[var(--mint)]' },
            { label: 'قيد الانتظار', value: String(s.pending), color: 'text-[var(--coral)]' },
          ] as StatCard[],
      ),
    );
  }

  removeLessonAccess(studentId: string, lessonId: number): Observable<void> {
    return this.http.delete<void>(`${this.teacherStudentsUrl}/${studentId}/lessons/${lessonId}`);
  }
}
