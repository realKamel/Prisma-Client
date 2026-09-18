import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Activity,
  CreateUserPayload,
  GradeOption,
  Lesson,
  RoleProfile,
  StatCard,
  StudentStatsRaw,
  TeacherOption,
  UpdateUserPayload,
  User,
  UserEditData,
} from '../Models/Admin/User.model';

@Service()
export class UserService {
  private http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly gradesUrl = `${environment.apiUrl}/grades`;
  private readonly teacherStudentsUrl = `${environment.apiUrl}/TeacherStudents`;

  // ── Users list / CRUD — backed by the new Admin-only UsersController ──────
  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }

  public getUserById(id: string): Observable<UserEditData> {
    return this.http.get<UserEditData>(`${this.usersUrl}/${id}`);
  }

  public createUser(payload: CreateUserPayload): Observable<UserEditData> {
    return this.http.post<UserEditData>(this.usersUrl, payload);
  }

  public updateUser(id: string, payload: UpdateUserPayload): Observable<UserEditData> {
    return this.http.put<UserEditData>(`${this.usersUrl}/${id}`, payload);
  }

  public deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }

  public getTeacherOptions(): Observable<TeacherOption[]> {
    return this.http.get<TeacherOption[]>(`${this.usersUrl}/teachers`);
  }

  public getGradeOptions(): Observable<GradeOption[]> {
    return this.http.get<GradeOption[]>(`${this.gradesUrl}/grade-options`);
  }

  public getTeacherProfile(id: string): Observable<RoleProfile> {
    return this.http.get<RoleProfile>(`${this.usersUrl}/${id}/teacher-dashboard`);
  }

  public getAssistantProfile(id: string): Observable<RoleProfile> {
    return this.http.get<RoleProfile>(`${this.usersUrl}/${id}/assistant-dashboard`);
  }

  public getAdminProfile(id: string): Observable<RoleProfile> {
    return this.http.get<RoleProfile>(`${this.usersUrl}/${id}/admin-dashboard`);
  }

  public getStudentLessons(studentId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.teacherStudentsUrl}/${studentId}/lessons`);
  }

  public getStudentActivities(studentId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.teacherStudentsUrl}/${studentId}/activities`);
  }

  public getStudentStats(studentId: string): Observable<StatCard[]> {
    return this.http.get<StudentStatsRaw>(`${this.teacherStudentsUrl}/${studentId}/stats`).pipe(
      map(
        (s) =>
          [
            { label: 'الدروس', value: String(s.lessons), color: 'text-primary-light' },
            { label: 'متوسط الكويزات', value: `${s.avgQuiz}٪`, color: 'text-star' },
            { label: 'الساعات', value: String(s.hours), color: 'text-mint' },
            { label: 'قيد الانتظار', value: String(s.pending), color: 'text-coral' },
          ] as StatCard[],
      ),
    );
  }

  public removeLessonAccess(studentId: string, lessonId: number): Observable<void> {
    return this.http.delete<void>(`${this.teacherStudentsUrl}/${studentId}/lessons/${lessonId}`);
  }
}
