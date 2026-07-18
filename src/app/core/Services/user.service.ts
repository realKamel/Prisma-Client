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

/** Every response from Prisma's Result<T> wrapper looks like this. */
interface ApiResult<T> {
  succeeded: boolean;
  message: string;
  errors?: Record<string, string[]> | null;
  data: T;
}

@Service()
export class UserService {
  private http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly gradesUrl = `${environment.apiUrl}/grades`;
  private readonly teacherStudentsUrl = `${environment.apiUrl.replace(/\/v1\/?$/, '')}/TeacherStudents`;

  // ── Users list / CRUD — backed by the new Admin-only UsersController ──────
  getUsers(): Observable<User[]> {
    return this.http.get<ApiResult<User[]>>(this.usersUrl).pipe(map((r) => r.data));
  }

  getUserById(id: string): Observable<UserEditData> {
    return this.http
      .get<ApiResult<UserEditData>>(`${this.usersUrl}/${id}`)
      .pipe(map((r) => r.data));
  }

  createUser(payload: CreateUserPayload): Observable<UserEditData> {
    return this.http.post<ApiResult<UserEditData>>(this.usersUrl, payload).pipe(map((r) => r.data));
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<UserEditData> {
    return this.http
      .put<ApiResult<UserEditData>>(`${this.usersUrl}/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }

  getTeacherOptions(): Observable<TeacherOption[]> {
    return this.http
      .get<ApiResult<TeacherOption[]>>(`${this.usersUrl}/teachers`)
      .pipe(map((r) => r.data));
  }

  getGradeOptions(): Observable<GradeOption[]> {
    return this.http
      .get<ApiResult<GradeOption[]>>(`${this.gradesUrl}/grade-options`)
      .pipe(map((r) => r.data));
  }

  getTeacherProfile(id: string): Observable<RoleProfile> {
    return this.http
      .get<ApiResult<RoleProfile>>(`${this.usersUrl}/${id}/teacher-dashboard`)
      .pipe(map((r) => r.data));
  }

  getAssistantProfile(id: string): Observable<RoleProfile> {
    return this.http
      .get<ApiResult<RoleProfile>>(`${this.usersUrl}/${id}/assistant-dashboard`)
      .pipe(map((r) => r.data));
  }

  getAdminProfile(id: string): Observable<RoleProfile> {
    return this.http
      .get<ApiResult<RoleProfile>>(`${this.usersUrl}/${id}/admin-dashboard`)
      .pipe(map((r) => r.data));
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
