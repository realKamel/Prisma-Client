import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Student, StudentLesson, StudentActivity, StudentStats,
  StudentFormData, GrantLessonRequest, ReportRequest, Lesson,
  AcademicYear, ACADEMIC_YEARS
} from '../Models/Teacher/student.model';

@Injectable({ providedIn: 'root' })
export class TeacherStudentsService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/teacherstudents';

  // ═══════════════════════════════════════════════════
  // Students List
  // ═══════════════════════════════════════════════════
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}`).pipe(
      catchError(() => this.getStudentsMock())
    );
  }

  // ═══════════════════════════════════════════════════
  // Single Student Profile
  // ═══════════════════════════════════════════════════
  getStudent(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => this.getStudentMock(0))
    );
  }

  getStudentLessons(id: string): Observable<StudentLesson[]> {
    return this.http.get<StudentLesson[]>(`${this.apiUrl}/${id}/lessons`).pipe(
      catchError(() => this.getStudentLessonsMock(0))
    );
  }

  getStudentActivities(id: string): Observable<StudentActivity[]> {
    return this.http.get<StudentActivity[]>(`${this.apiUrl}/${id}/activities`).pipe(
      catchError(() => this.getStudentActivitiesMock(0))
    );
  }

  getStudentStats(id: string): Observable<StudentStats> {
    return this.http.get<StudentStats>(`${this.apiUrl}/${id}/stats`).pipe(
      catchError(() => this.getStudentStatsMock(0))
    );
  }

  // ═══════════════════════════════════════════════════
  // Add Student
  // ═══════════════════════════════════════════════════
  addStudent(data: StudentFormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data).pipe(
      catchError(() => this.addStudentMock(data))
    );
  }

  // ═══════════════════════════════════════════════════
  // Lessons for Grant
  // ═══════════════════════════════════════════════════
  getAllLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/lessons-for-grant`).pipe(
      catchError(() => this.getAllLessonsMock())
    );
  }

  // ═══════════════════════════════════════════════════
  // Grant / Revoke Lesson
  // ═══════════════════════════════════════════════════
  grantLesson(request: GrantLessonRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/grant`, request).pipe(
      catchError(() => this.grantLessonMock(request))
    );
  }

  revokeLessonAccess(studentId: string, lessonId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${studentId}/lessons/${lessonId}`).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // ═══════════════════════════════════════════════════
  // Send Report
  // ═══════════════════════════════════════════════════
  sendReport(request: ReportRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/send`, request).pipe(
      catchError(() => this.sendReportMock(request))
    );
  }

  // ═══════════════════════════════════════════════════
  // Academic Years
  // ═══════════════════════════════════════════════════
  getAcademicYears(): Observable<AcademicYear[]> {
    // TODO: Replace with real endpoint when backend has one
    // return this.http.get<AcademicYear[]>(`${this.apiUrl}/academic-years`).pipe(
    //   catchError(() => of(ACADEMIC_YEARS))
    // );
    return of(ACADEMIC_YEARS).pipe(delay(300));
  }

  // ═══════════════════════════════════════════════════
  // MOCK DATA — Fallback when backend fails
  // ═══════════════════════════════════════════════════

  private getStudentsMock(): Observable<Student[]> {
    const data: Student[] = [
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699b1', name: 'محمد أحمد سالم', grade: 'الصف الثاني الثانوي', lastActive: 'منذ ٥ د', lessons: 3, avgQuiz: 88, active: true, phone: '01012345678', parentPhone: '01098765432' },
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699b2', name: 'نورا حسن علي', grade: 'الصف الثالث الثانوي', lastActive: 'منذ ١ س', lessons: 2, avgQuiz: 74, active: true, phone: '01123456789', parentPhone: '' },
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699b3', name: 'يوسف محمود كمال', grade: 'الصف الأول الثانوي', lastActive: 'منذ ٢ س', lessons: 4, avgQuiz: 91, active: true, phone: '01234567890', parentPhone: '01056789012' },
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699b4', name: 'سارة خالد عبد الله', grade: 'الصف الثاني الثانوي', lastActive: 'منذ ٣ س', lessons: 1, avgQuiz: 65, active: true, phone: '01098765432', parentPhone: '' },
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699b5', name: 'عمر أحمد فاروق', grade: 'الصف الثالث الإعدادي', lastActive: 'منذ يوم', lessons: 2, avgQuiz: 57, active: false, phone: '01587654321', parentPhone: '01112345678' },
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699b6', name: 'منى سامي طاهر', grade: 'الصف الثالث الثانوي', lastActive: 'منذ يومين', lessons: 3, avgQuiz: 80, active: true, phone: '01654321987', parentPhone: '' },
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699b7', name: 'علي حسين عمر', grade: 'الصف الأول الثانوي', lastActive: 'منذ ٣ أيام', lessons: 1, avgQuiz: 70, active: false, phone: '01765432198', parentPhone: '01087654321' },
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699b8', name: 'دينا وليد سامي', grade: 'الصف الثاني الثانوي', lastActive: 'منذ ٤ أيام', lessons: 2, avgQuiz: 93, active: true, phone: '01876543219', parentPhone: '' },
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699b9', name: 'كريم طارق عبيد', grade: 'الصف الثالث الثانوي', lastActive: 'منذ أسبوع', lessons: 1, avgQuiz: 62, active: false, phone: '01987654321', parentPhone: '01234560987' },
      { id: 'b90a811d-98a4-4353-81a5-cc75e32699ba', name: 'هنا أيمن مصطفى', grade: 'الصف الأول الثانوي', lastActive: 'منذ أسبوع', lessons: 3, avgQuiz: 85, active: true, phone: '01098712345', parentPhone: '' },
    ];
    return of(data).pipe(delay(800));
  }

  private getStudentMock(id: number): Observable<Student> {
    const data: Student = { id: 'b90a811d-98a4-4353-81a5-cc75e32699b1', name: 'محمد أحمد سالم', grade: 'الصف الثاني الثانوي', lastActive: 'منذ ٥ د', lessons: 3, avgQuiz: 88, active: true, phone: '01012345678', parentPhone: '01098765432' };
    return of(data).pipe(delay(600));
  }

  private getStudentLessonsMock(id: number): Observable<StudentLesson[]> {
    const data: StudentLesson[] = [
      { id: 1, title: 'الكهرباء الساكنة — قانون كولوم', method: 'اشتراك ذاتي', grantedBy: '—', status: 'مكتمل', progress: 100, statusColor: 'bg-[rgba(78,203,141,0.16)] text-[var(--mint)]', progressColor: 'bg-[var(--mint)]' },
      { id: 2, title: 'قوانين نيوتن للحركة', method: 'اشتراك ذاتي', grantedBy: '—', status: 'في التقدم', progress: 68, statusColor: 'bg-[rgba(147,112,219,0.12)] text-[var(--purple-lt)]', progressColor: 'bg-[var(--purple)]' },
      { id: 3, title: 'الموجات الصوتية', method: 'مُنح', grantedBy: 'دينا وليد', status: 'جديد', progress: 0, statusColor: 'bg-[var(--surface2)] text-[var(--muted)]', progressColor: 'bg-[var(--purple)]' },
      { id: 4, title: 'المغناطيسية والكهرومغناطيسية', method: 'مُنح', grantedBy: 'سامي طارق', status: 'في التقدم', progress: 35, statusColor: 'bg-[rgba(147,112,219,0.12)] text-[var(--purple-lt)]', progressColor: 'bg-[var(--purple)]' },
    ];
    return of(data).pipe(delay(500));
  }

  private getStudentActivitiesMock(id: number): Observable<StudentActivity[]> {
    const data: StudentActivity[] = [
      { message: 'أكمل درس الكهرباء الساكنة', time: 'اليوم، ٩:٣٠ ص', dotColor: 'bg-[var(--mint)]' },
      { message: 'سلّم كويز الكهرباء — نتيجة ٩٢٪', time: 'اليوم، ٨:٤٥ ص', dotColor: 'bg-[var(--star)]' },
      { message: 'اشترى درس الموجات الصوتية', time: 'أمس، ٦:١٠ م', dotColor: 'bg-[var(--border)]' },
      { message: 'بدأ مذاكرة قوانين نيوتن', time: 'أمس، ٤:٠٠ م', dotColor: 'bg-[var(--purple-lt)]' },
      { message: 'سجّل في المنصة وبدأ أول درس', time: 'منذ ٣ أيام', dotColor: 'bg-[var(--border)]' },
    ];
    return of(data).pipe(delay(500));
  }

  private getStudentStatsMock(id: number): Observable<StudentStats> {
    return of({ lessons: 4, avgQuiz: 88, hours: 4, pending: 1 }).pipe(delay(500));
  }

  private addStudentMock(data: StudentFormData): Observable<any> {
    return of({ success: true, id: 'b90a811d-98a4-4353-81a5-cc75e32699ff' }).pipe(delay(1400));
  }

  private getAllLessonsMock(): Observable<Lesson[]> {
    const data: Lesson[] = [
      { id: 1, title: 'الكهرباء الساكنة', chapters: '٥' },
      { id: 2, title: 'الحركة المتسارعة', chapters: '٤' },
      { id: 3, title: 'الموجات الصوتية', chapters: '٤' },
      { id: 4, title: 'المغناطيسية', chapters: '٥' },
      { id: 5, title: 'الطاقة الميكانيكية', chapters: '٣' },
      { id: 6, title: 'الضغط والسوائل', chapters: '٤' },
      { id: 7, title: 'الثرموديناميكا', chapters: '٦' },
      { id: 8, title: 'البصريات الهندسية', chapters: '٤' },
    ];
    return of(data).pipe(delay(600));
  }

  private grantLessonMock(request: GrantLessonRequest): Observable<any> {
    return of({ success: true }).pipe(delay(1600));
  }

  private sendReportMock(request: ReportRequest): Observable<any> {
    return of({ success: true, sentCount: request.studentIds.length }).pipe(delay(1800));
  }
}