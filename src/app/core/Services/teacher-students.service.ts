import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Student, StudentLesson, StudentActivity, StudentStats,
  StudentFormData, GrantLessonRequest, ReportRequest, Lesson
} from '../Models/Teacher/student.model';

@Injectable({ providedIn: 'root' })
export class TeacherStudentsService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/teacher/students';

  // ═══════════════════════════════════════════════════
  // Students List
  // ═══════════════════════════════════════════════════
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}`);
  }

  // ═══════════════════════════════════════════════════
  // Single Student Profile
  // ═══════════════════════════════════════════════════
  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  getStudentLessons(id: number): Observable<StudentLesson[]> {
    return this.http.get<StudentLesson[]>(`${this.apiUrl}/${id}/lessons`);
  }

  getStudentActivities(id: number): Observable<StudentActivity[]> {
    return this.http.get<StudentActivity[]>(`${this.apiUrl}/${id}/activities`);
  }

  getStudentStats(id: number): Observable<StudentStats> {
    return this.http.get<StudentStats>(`${this.apiUrl}/${id}/stats`);
  }

  // ═══════════════════════════════════════════════════
  // Add / Edit Student
  // ═══════════════════════════════════════════════════
  addStudent(data: StudentFormData): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}`, data);
  }

  updateStudent(id: number, data: StudentFormData): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, data);
  }

  // ═══════════════════════════════════════════════════
  // Grant / Revoke Lesson
  // ═══════════════════════════════════════════════════
  getAllLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`/api/lessons`);
  }

  grantLesson(request: GrantLessonRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/grant`, request);
  }

  revokeLessonAccess(studentId: number, lessonId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${studentId}/lessons/${lessonId}`);
  }

  // ═══════════════════════════════════════════════════
  // Send Report
  // ═══════════════════════════════════════════════════
  sendReport(request: ReportRequest): Observable<any> {
    return this.http.post(`/api/reports/send`, request);
  }

  // ═══════════════════════════════════════════════════
  // MOCK DATA — Temporary until backend is ready
  // ═══════════════════════════════════════════════════

  getStudentsMock(): Observable<Student[]> {
    const data: Student[] = [
      { id: 1, name: 'محمد أحمد سالم', grade: 'ثانوية ٢', lastActive: 'منذ ٥ د', lessons: 3, avgQuiz: 88, active: true, phone: '01012345678', parentPhone: '01098765432', notes: '' },
      { id: 2, name: 'نورا حسن علي', grade: 'ثانوية ٣', lastActive: 'منذ ١ س', lessons: 2, avgQuiz: 74, active: true, phone: '01123456789', parentPhone: '', notes: '' },
      { id: 3, name: 'يوسف محمود كمال', grade: 'ثانوية ١', lastActive: 'منذ ٢ س', lessons: 4, avgQuiz: 91, active: true, phone: '01234567890', parentPhone: '01056789012', notes: '' },
      { id: 4, name: 'سارة خالد عبد الله', grade: 'ثانوية ٢', lastActive: 'منذ ٣ س', lessons: 1, avgQuiz: 65, active: true, phone: '01098765432', parentPhone: '', notes: '' },
      { id: 5, name: 'عمر أحمد فاروق', grade: 'إعدادية ٣', lastActive: 'منذ يوم', lessons: 2, avgQuiz: 57, active: false, phone: '01587654321', parentPhone: '01112345678', notes: '' },
      { id: 6, name: 'منى سامي طاهر', grade: 'ثانوية ٣', lastActive: 'منذ يومين', lessons: 3, avgQuiz: 80, active: true, phone: '01654321987', parentPhone: '', notes: '' },
      { id: 7, name: 'علي حسين عمر', grade: 'ثانوية ١', lastActive: 'منذ ٣ أيام', lessons: 1, avgQuiz: 70, active: false, phone: '01765432198', parentPhone: '01087654321', notes: '' },
      { id: 8, name: 'دينا وليد سامي', grade: 'ثانوية ٢', lastActive: 'منذ ٤ أيام', lessons: 2, avgQuiz: 93, active: true, phone: '01876543219', parentPhone: '', notes: '' },
      { id: 9, name: 'كريم طارق عبيد', grade: 'ثانوية ٣', lastActive: 'منذ أسبوع', lessons: 1, avgQuiz: 62, active: false, phone: '01987654321', parentPhone: '01234560987', notes: '' },
      { id: 10, name: 'هنا أيمن مصطفى', grade: 'ثانوية ١', lastActive: 'منذ أسبوع', lessons: 3, avgQuiz: 85, active: true, phone: '01098712345', parentPhone: '', notes: '' },
    ];
    return of(data).pipe(delay(800));
  }

  getStudentMock(id: number): Observable<Student> {
    const data: Student = { id, name: 'محمد أحمد سالم', grade: 'ثانوية ٢', lastActive: 'منذ ٥ د', lessons: 3, avgQuiz: 88, active: true, phone: '01012345678', parentPhone: '01098765432', notes: '' };
    return of(data).pipe(delay(600));
  }

  getStudentLessonsMock(id: number): Observable<StudentLesson[]> {
    const data: StudentLesson[] = [
      { id: 1, title: 'الكهرباء الساكنة — قانون كولوم', method: 'اشتراك ذاتي', grantedBy: '—', status: 'مكتمل', progress: 100, statusColor: 'bg-[rgba(78,203,141,0.16)] text-[var(--mint)]', progressColor: 'bg-[var(--mint)]' },
      { id: 2, title: 'قوانين نيوتن للحركة', method: 'اشتراك ذاتي', grantedBy: '—', status: 'في التقدم', progress: 68, statusColor: 'bg-[rgba(147,112,219,0.12)] text-[var(--purple-lt)]', progressColor: 'bg-[var(--purple)]' },
      { id: 3, title: 'الموجات الصوتية', method: 'مُنح', grantedBy: 'دينا وليد', status: 'جديد', progress: 0, statusColor: 'bg-[var(--surface2)] text-[var(--muted)]', progressColor: 'bg-[var(--purple)]' },
      { id: 4, title: 'المغناطيسية والكهرومغناطيسية', method: 'مُنح', grantedBy: 'سامي طارق', status: 'في التقدم', progress: 35, statusColor: 'bg-[rgba(147,112,219,0.12)] text-[var(--purple-lt)]', progressColor: 'bg-[var(--purple)]' },
    ];
    return of(data).pipe(delay(500));
  }

  getStudentActivitiesMock(id: number): Observable<StudentActivity[]> {
    const data: StudentActivity[] = [
      { message: 'أكمل درس الكهرباء الساكنة', time: 'اليوم، ٩:٣٠ ص', dotColor: 'bg-[var(--mint)]' },
      { message: 'سلّم كويز الكهرباء — نتيجة ٩٢٪', time: 'اليوم، ٨:٤٥ ص', dotColor: 'bg-[var(--star)]' },
      { message: 'اشترى درس الموجات الصوتية', time: 'أمس، ٦:١٠ م', dotColor: 'bg-[var(--border)]' },
      { message: 'بدأ مذاكرة قوانين نيوتن', time: 'أمس، ٤:٠٠ م', dotColor: 'bg-[var(--purple-lt)]' },
      { message: 'سجّل في المنصة وبدأ أول درس', time: 'منذ ٣ أيام', dotColor: 'bg-[var(--border)]' },
    ];
    return of(data).pipe(delay(500));
  }

  getStudentStatsMock(id: number): Observable<StudentStats> {
    return of({ lessons: 4, avgQuiz: 88, hours: 4, pending: 1 }).pipe(delay(500));
  }

  addStudentMock(data: StudentFormData): Observable<Student> {
    return of({ id: 99, name: data.fullName, grade: data.grade, lastActive: 'الآن', lessons: 0, avgQuiz: 0, active: true, phone: data.mobile, parentPhone: data.parentMobile, notes: data.notes }).pipe(delay(1400));
  }

  updateStudentMock(id: number, data: StudentFormData): Observable<Student> {
    return of({ id, name: data.fullName, grade: data.grade, lastActive: 'الآن', lessons: 0, avgQuiz: 0, active: true, phone: data.mobile, parentPhone: data.parentMobile, notes: data.notes }).pipe(delay(1400));
  }

  getAllLessonsMock(): Observable<Lesson[]> {
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

  grantLessonMock(request: GrantLessonRequest): Observable<any> {
    return of({ success: true }).pipe(delay(1600));
  }

  sendReportMock(request: ReportRequest): Observable<any> {
    return of({ success: true, sentCount: request.studentIds.length }).pipe(delay(1800));
  }
}
