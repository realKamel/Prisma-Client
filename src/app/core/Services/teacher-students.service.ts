import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ACADEMIC_YEARS,
  AcademicYear,
  GrantLessonRequest,
  Lesson,
  ReportRequest,
  Student,
  StudentActivity,
  StudentFormData,
  StudentLesson,
  StudentStats,
} from '../Models/Teacher/student.model';

@Service()
export class TeacherStudentsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/teacherstudents`;

  // ═══════════════════════════════════════════════════
  // Students List
  // ═══════════════════════════════════════════════════
  public getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}`).pipe(catchError(() => []));
  }

  // ═══════════════════════════════════════════════════
  // Single Student Profile
  // ═══════════════════════════════════════════════════
  public getStudent(id: string): Observable<Student> {
    return this.http
      .get<Student>(`${this.apiUrl}/${id}`)
      .pipe(catchError(() => this.getStudentMock(0)));
  }

  // ═══════════════════════════════════════════════════
  // Student data shaped for the edit form
  // ═══════════════════════════════════════════════════
  public getStudentForEdit(id: string): Observable<StudentFormData & { id: string }> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((s: any) => {
        // ── name: use individual parts if backend sends them,
        //    otherwise split the combined name string ──────────
        let firstName = s.firstName ?? '';
        let secondName = s.secondName ?? '';
        let thirdName = s.thirdName ?? '';
        let lastName = s.lastName ?? '';

        if (!firstName && s.name) {
          const parts = s.name.trim().split(/\s+/);
          firstName = parts[0] ?? '';
          secondName = parts[1] ?? '';
          thirdName = parts[2] ?? '';
          lastName = parts.slice(3).join(' ') ?? '';
        }

        // ── gradeId: use numeric id if present,
        //    otherwise find it by matching the grade title string ──
        let gradeId = s.gradeId ?? 0;
        if (!gradeId && s.grade) {
          const match = ACADEMIC_YEARS.find((y) => y.name === s.grade);
          if (match) gradeId = match.id;
        }

        return {
          id: s.id,
          firstName,
          secondName,
          thirdName,
          lastName,
          mobile: s.phone ?? '',
          email: s.email ?? '',
          password: '',
          grade: gradeId,
          parentMobile: s.parentPhone ?? '',
        };
      }),
      catchError(() => this.getStudentForEditMock(id)),
    );
  }

  public getStudentLessons(id: string): Observable<StudentLesson[]> {
    return this.http
      .get<StudentLesson[]>(`${this.apiUrl}/${id}/lessons`)
      .pipe(catchError(() => this.getStudentLessonsMock(0)));
  }

  public getStudentActivities(id: string): Observable<StudentActivity[]> {
    return this.http
      .get<StudentActivity[]>(`${this.apiUrl}/${id}/activities`)
      .pipe(catchError(() => this.getStudentActivitiesMock(0)));
  }

  public getStudentStats(id: string): Observable<StudentStats> {
    return this.http
      .get<StudentStats>(`${this.apiUrl}/${id}/stats`)
      .pipe(catchError(() => this.getStudentStatsMock(0)));
  }

  // ═══════════════════════════════════════════════════
  // Add Student
  // ═══════════════════════════════════════════════════
  public addStudent(data: StudentFormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data).pipe(catchError(() => this.addStudentMock(data)));
  }

  // ═══════════════════════════════════════════════════
  // Update Student
  // ═══════════════════════════════════════════════════
  public updateStudent(
    id: string,
    data: Omit<StudentFormData, 'password'> & { newPassword?: string },
  ): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/${id}`, data)
      .pipe(catchError(() => of({ success: true }).pipe(delay(800))));
  }

  // ═══════════════════════════════════════════════════
  // All Lessons (for filter dropdown — from DB)
  // ═══════════════════════════════════════════════════
  public getLessons(): Observable<Lesson[]> {
    return this.http
      .get<Lesson[]>(`${this.apiUrl}/lessons`)
      .pipe(catchError(() => this.getAllLessonsMock()));
  }

  // ═══════════════════════════════════════════════════
  // Lessons for Grant
  // ═══════════════════════════════════════════════════
  public getAllLessons(): Observable<Lesson[]> {
    return this.http
      .get<Lesson[]>(`${this.apiUrl}/lessons-for-grant`)
      .pipe(catchError(() => this.getAllLessonsMock()));
  }

  // ═══════════════════════════════════════════════════
  // Grant / Revoke Lesson
  // ═══════════════════════════════════════════════════
  public grantLesson(request: GrantLessonRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/grant`, request)
      .pipe(catchError(() => this.grantLessonMock(request)));
  }

  public revokeLessonAccess(studentId: string, lessonId: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${studentId}/lessons/${lessonId}`)
      .pipe(catchError(() => of({ success: true })));
  }

  // ═══════════════════════════════════════════════════
  // Send Report
  // ═══════════════════════════════════════════════════
  public sendReport(request: ReportRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/reports/send`, request)
      .pipe(catchError(() => this.sendReportMock(request)));
  }

  // ═══════════════════════════════════════════════════
  // Academic Years (from DB)
  // ═══════════════════════════════════════════════════
  public getAcademicYears(): Observable<AcademicYear[]> {
    return this.http
      .get<AcademicYear[]>(`${this.apiUrl}/academic-years`)
      .pipe(catchError(() => of(ACADEMIC_YEARS).pipe(delay(300))));
  }

  private getStudentMock(id: number): Observable<Student> {
    const data: Student = {
      id: 'b90a811d-98a4-4353-81a5-cc75e32699b1',
      name: 'محمد أحمد سالم',
      grade: 'الصف الثاني الثانوي',
      lastActive: 'منذ ٥ د',
      lessons: 3,
      avgQuiz: 88,
      active: true,
      phone: '01012345678',
      parentPhone: '01098765432',
      lessonTitles: ['الكهرباء الساكنة', 'قوانين نيوتن', 'الموجات الصوتية'],
      gradeId: 5,
    };
    return of(data).pipe(delay(600));
  }

  private getStudentForEditMock(id: string): Observable<StudentFormData & { id: string }> {
    return of({
      id,
      firstName: 'محمد',
      secondName: 'أحمد',
      thirdName: 'سالم',
      lastName: 'عبدالله',
      mobile: '01012345678',
      email: '',
      password: '',
      grade: 5,
      parentMobile: '01098765432',
    }).pipe(delay(600));
  }

  private getStudentLessonsMock(id: number): Observable<StudentLesson[]> {
    return of([
      {
        id: 1,
        title: 'الكهرباء الساكنة — قانون كولوم',
        method: 'اشتراك ذاتي',
        grantedBy: '—',
        status: 'مكتمل',
        progress: 100,
        statusColor: 'bg-[rgba(78,203,141,0.16)] text-mint',
        progressColor: 'bg-mint',
      },
      {
        id: 2,
        title: 'قوانين نيوتن للحركة',
        method: 'اشتراك ذاتي',
        grantedBy: '—',
        status: 'في التقدم',
        progress: 68,
        statusColor: 'bg-[rgba(147,112,219,0.12)] text-primary-light',
        progressColor: 'bg-primary',
      },
    ]).pipe(delay(500));
  }

  private getStudentActivitiesMock(id: number): Observable<StudentActivity[]> {
    return of([
      { message: 'أكمل درس الكهرباء الساكنة', time: 'اليوم، ٩:٣٠ ص', dotColor: 'bg-mint' },
      {
        message: 'سلّم كويز الكهرباء — نتيجة ٩٢٪',
        time: 'اليوم، ٨:٤٥ ص',
        dotColor: 'bg-star',
      },
    ]).pipe(delay(500));
  }

  private getStudentStatsMock(id: number): Observable<StudentStats> {
    return of({ lessons: 4, avgQuiz: 88, hours: 4, pending: 1 }).pipe(delay(500));
  }

  private addStudentMock(data: StudentFormData): Observable<any> {
    return of({ success: true, id: 'b90a811d-98a4-4353-81a5-cc75e32699ff' }).pipe(delay(1400));
  }

  private getAllLessonsMock(): Observable<Lesson[]> {
    return of([
      { id: 1, title: 'الكهرباء الساكنة', chapters: '٥' },
      { id: 2, title: 'الحركة المتسارعة', chapters: '٤' },
      { id: 3, title: 'الموجات الصوتية', chapters: '٤' },
      { id: 4, title: 'المغناطيسية', chapters: '٥' },
      { id: 5, title: 'الطاقة الميكانيكية', chapters: '٣' },
      { id: 6, title: 'الضغط والسوائل', chapters: '٤' },
      { id: 7, title: 'الثرموديناميكا', chapters: '٦' },
      { id: 8, title: 'البصريات الهندسية', chapters: '٤' },
    ]).pipe(delay(600));
  }

  private grantLessonMock(request: GrantLessonRequest): Observable<any> {
    return of({ success: true }).pipe(delay(1600));
  }

  private sendReportMock(request: ReportRequest): Observable<any> {
    return of({ success: true, sentCount: request.studentIds.length }).pipe(delay(1800));
  }
}
