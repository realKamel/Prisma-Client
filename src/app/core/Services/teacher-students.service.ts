import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Student,
  StudentLesson,
  StudentActivity,
  StudentStats,
  StudentFormData,
  GrantLessonRequest,
  ReportRequest,
  Lesson,
  AcademicYear,
  ACADEMIC_YEARS,
} from '../Models/Teacher/student.model';
import { environment } from '../../../environments/environment';

@Service()
export class TeacherStudentsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/teacherstudents`;

  // ═══════════════════════════════════════════════════
  // Students List
  // ═══════════════════════════════════════════════════
  getStudents(): Observable<Student[]> {
    return this.http
      .get<Student[]>(`${this.apiUrl}`)
      .pipe(catchError(() => this.getStudentsMock()));
  }

  // ═══════════════════════════════════════════════════
  // Single Student Profile
  // ═══════════════════════════════════════════════════
  getStudent(id: string): Observable<Student> {
    return this.http
      .get<Student>(`${this.apiUrl}/${id}`)
      .pipe(catchError(() => this.getStudentMock(0)));
  }

  // ═══════════════════════════════════════════════════
  // Student data shaped for the edit form
  // ═══════════════════════════════════════════════════
  getStudentForEdit(id: string): Observable<StudentFormData & { id: string }> {
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

  getStudentLessons(id: string): Observable<StudentLesson[]> {
    return this.http
      .get<StudentLesson[]>(`${this.apiUrl}/${id}/lessons`)
      .pipe(catchError(() => this.getStudentLessonsMock(0)));
  }

  getStudentActivities(id: string): Observable<StudentActivity[]> {
    return this.http
      .get<StudentActivity[]>(`${this.apiUrl}/${id}/activities`)
      .pipe(catchError(() => this.getStudentActivitiesMock(0)));
  }

  getStudentStats(id: string): Observable<StudentStats> {
    return this.http
      .get<StudentStats>(`${this.apiUrl}/${id}/stats`)
      .pipe(catchError(() => this.getStudentStatsMock(0)));
  }

  // ═══════════════════════════════════════════════════
  // Add Student
  // ═══════════════════════════════════════════════════
  addStudent(data: StudentFormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data).pipe(catchError(() => this.addStudentMock(data)));
  }

  // ═══════════════════════════════════════════════════
  // Update Student
  // ═══════════════════════════════════════════════════
  updateStudent(
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
  getLessons(): Observable<Lesson[]> {
    return this.http
      .get<Lesson[]>(`${this.apiUrl}/lessons`)
      .pipe(catchError(() => this.getAllLessonsMock()));
  }

  // ═══════════════════════════════════════════════════
  // Lessons for Grant
  // ═══════════════════════════════════════════════════
  getAllLessons(): Observable<Lesson[]> {
    return this.http
      .get<Lesson[]>(`${this.apiUrl}/lessons-for-grant`)
      .pipe(catchError(() => this.getAllLessonsMock()));
  }

  // ═══════════════════════════════════════════════════
  // Grant / Revoke Lesson
  // ═══════════════════════════════════════════════════
  grantLesson(request: GrantLessonRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/grant`, request)
      .pipe(catchError(() => this.grantLessonMock(request)));
  }

  revokeLessonAccess(studentId: string, lessonId: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${studentId}/lessons/${lessonId}`)
      .pipe(catchError(() => of({ success: true })));
  }

  // ═══════════════════════════════════════════════════
  // Send Report
  // ═══════════════════════════════════════════════════
  sendReport(request: ReportRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/reports/send`, request)
      .pipe(catchError(() => this.sendReportMock(request)));
  }

  // ═══════════════════════════════════════════════════
  // Academic Years (from DB)
  // ═══════════════════════════════════════════════════
  getAcademicYears(): Observable<AcademicYear[]> {
    return this.http
      .get<AcademicYear[]>(`${this.apiUrl}/academic-years`)
      .pipe(catchError(() => of(ACADEMIC_YEARS).pipe(delay(300))));
  }

  // ═══════════════════════════════════════════════════
  // MOCK DATA
  // ═══════════════════════════════════════════════════

  private getStudentsMock(): Observable<Student[]> {
    const data: Student[] = [
      {
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
      },
      {
        id: 'b90a811d-98a4-4353-81a5-cc75e32699b2',
        name: 'نورا حسن علي',
        grade: 'الصف الثالث الثانوي',
        lastActive: 'منذ ١ س',
        lessons: 2,
        avgQuiz: 74,
        active: true,
        phone: '01123456789',
        parentPhone: '',
        lessonTitles: ['المغناطيسية', 'الحركة المتسارعة'],
        gradeId: 6,
      },
      {
        id: 'b90a811d-98a4-4353-81a5-cc75e32699b3',
        name: 'يوسف محمود كمال',
        grade: 'الصف الأول الثانوي',
        lastActive: 'منذ ٢ س',
        lessons: 4,
        avgQuiz: 91,
        active: true,
        phone: '01234567890',
        parentPhone: '01056789012',
        lessonTitles: ['الكهرباء الساكنة', 'قوانين نيوتن', 'البصريات الهندسية', 'الثرموديناميكا'],
        gradeId: 4,
      },
      {
        id: 'b90a811d-98a4-4353-81a5-cc75e32699b4',
        name: 'سارة خالد عبد الله',
        grade: 'الصف الثاني الثانوي',
        lastActive: 'منذ ٣ س',
        lessons: 1,
        avgQuiz: 65,
        active: true,
        phone: '01098765432',
        parentPhone: '',
        lessonTitles: ['الضغط والسوائل'],
        gradeId: 5,
      },
      {
        id: 'b90a811d-98a4-4353-81a5-cc75e32699b5',
        name: 'عمر أحمد فاروق',
        grade: 'الصف الثالث الإعدادي',
        lastActive: 'منذ يوم',
        lessons: 2,
        avgQuiz: 57,
        active: false,
        phone: '01587654321',
        parentPhone: '01112345678',
        lessonTitles: ['الموجات الصوتية', 'الطاقة الميكانيكية'],
        gradeId: 3,
      },
      {
        id: 'b90a811d-98a4-4353-81a5-cc75e32699b6',
        name: 'منى سامي طاهر',
        grade: 'الصف الثالث الثانوي',
        lastActive: 'منذ يومين',
        lessons: 3,
        avgQuiz: 80,
        active: true,
        phone: '01654321987',
        parentPhone: '',
        lessonTitles: ['قوانين نيوتن', 'المغناطيسية', 'البصريات الهندسية'],
        gradeId: 6,
      },
      {
        id: 'b90a811d-98a4-4353-81a5-cc75e32699b7',
        name: 'علي حسين عمر',
        grade: 'الصف الأول الثانوي',
        lastActive: 'منذ ٣ أيام',
        lessons: 1,
        avgQuiz: 70,
        active: false,
        phone: '01765432198',
        parentPhone: '01087654321',
        lessonTitles: ['الكهرباء الساكنة'],
        gradeId: 4,
      },
      {
        id: 'b90a811d-98a4-4353-81a5-cc75e32699b8',
        name: 'دينا وليد سامي',
        grade: 'الصف الثاني الثانوي',
        lastActive: 'منذ ٤ أيام',
        lessons: 2,
        avgQuiz: 93,
        active: true,
        phone: '01876543219',
        parentPhone: '',
        lessonTitles: ['الثرموديناميكا', 'الضغط والسوائل'],
        gradeId: 5,
      },
      {
        id: 'b90a811d-98a4-4353-81a5-cc75e32699b9',
        name: 'كريم طارق عبيد',
        grade: 'الصف الثالث الثانوي',
        lastActive: 'منذ أسبوع',
        lessons: 1,
        avgQuiz: 62,
        active: false,
        phone: '01987654321',
        parentPhone: '01234560987',
        lessonTitles: ['الحركة المتسارعة'],
        gradeId: 6,
      },
      {
        id: 'b90a811d-98a4-4353-81a5-cc75e32699ba',
        name: 'هنا أيمن مصطفى',
        grade: 'الصف الأول الثانوي',
        lastActive: 'منذ أسبوع',
        lessons: 3,
        avgQuiz: 85,
        active: true,
        phone: '01098712345',
        parentPhone: '',
        lessonTitles: ['الموجات الصوتية', 'الطاقة الميكانيكية', 'البصريات الهندسية'],
        gradeId: 4,
      },
    ];
    return of(data).pipe(delay(800));
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
