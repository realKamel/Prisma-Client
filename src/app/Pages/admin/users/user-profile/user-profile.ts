import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

// ── Models ───────────────────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'Teacher' | 'Student' | 'Assistant';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  grade?: string;
  gradeId?: number;
  teacherId?: number;
  teacherName?: string;
  parentPhone?: string;
  active: boolean;
  joined: string;
  lastActive: string;
  avatarColor?: string;
}

export interface Lesson {
  id: string;
  title: string;
  method: 'اشتراك ذاتي' | 'منح من المعلم';
  grantedBy?: string;
  progress: number;
  status: string;
  statusColor: string;
  progressColor: string;
}

export interface Quiz {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
  status: string;
  statusColor: string;
}

export interface Activity {
  id: string;
  message: string;
  time: string;
  dotColor: string;
}

export interface LoginRecord {
  id: string;
  ip: string;
  device: string;
  time: string;
  location: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface StudentSummary {
  id: string;
  name: string;
  grade: string;
  lessonsCount: number;
  avgQuiz: number;
  active: boolean;
}

export interface AssistantSummary {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export interface TeacherSummary {
  id: string;
  name: string;
  subject: string;
  studentsCount: number;
}

export interface StatCard {
  label: string;
  value: string;
  color: string;
}

// ── Component ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.html',
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  userId = '';
  user: User = { id: '', name: '', email: '', phone: '', role: 'Student', active: false, joined: '', lastActive: '' };
  loading = true;

  // Role-specific data
  lessons: Lesson[] = [];
  quizzes: Quiz[] = [];
  activities: Activity[] = [];
  loginRecords: LoginRecord[] = [];
  permissions: Permission[] = [];
  students: StudentSummary[] = [];
  assistants: AssistantSummary[] = [];
  teachers: TeacherSummary[] = [];
  stats: StatCard[] = [];

  // Modal
  removeLessonModal = false;
  lessonToRemove: Lesson | null = null;

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadAllData();
    }
  }

  loadAllData() {
    this.loading = true;
    this.cdr.detectChanges();

    // Simulate API loading — replace with real service calls
    setTimeout(() => {
      this.user = this.getDummyUser(this.userId);
      this.loadRoleSpecificData();
      this.loading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  private getDummyUser(id: string): User {
    const users: Record<string, User> = {
      '1': { id: '1', name: 'أحمد محمد علي', email: 'ahmed.m@gmail.com', phone: '01012345678', role: 'Admin', active: true, joined: '2024-01-15', lastActive: 'منذ 5 دقائق', avatarColor: '#8b5cf6' },
      '2': { id: '2', name: 'سارة خالد عبدالله', email: 'sara.k@gmail.com', phone: '01123456789', role: 'Teacher', active: true, joined: '2024-02-10', lastActive: 'منذ ساعة', avatarColor: '#3b82f6' },
      '3': { id: '3', name: 'محمد إبراهيم حسن', email: 'mohamed.i@gmail.com', phone: '01234567890', role: 'Student', grade: 'الصف الثاني الثانوي', gradeId: 2, teacherId: 2, teacherName: 'سارة خالد عبدالله', parentPhone: '01598765432', active: true, joined: '2024-03-05', lastActive: 'منذ يومين', avatarColor: '#4ecb8d' },
      '4': { id: '4', name: 'فاطمة أحمد محمود', email: 'fatima.a@gmail.com', phone: '01098765432', role: 'Assistant', teacherId: 1, teacherName: 'أحمد محمد علي', active: false, joined: '2024-03-20', lastActive: 'منذ أسبوع', avatarColor: '#f59e0b' },
    };
    return users[id] || users['1'];
  }

  private loadRoleSpecificData() {
    switch (this.user.role) {
      case 'Admin':
        this.loadAdminData();
        break;
      case 'Teacher':
        this.loadTeacherData();
        break;
      case 'Student':
        this.loadStudentData();
        break;
      case 'Assistant':
        this.loadAssistantData();
        break;
    }
  }

  // ── Admin Data ────────────────────────────────────────────────────────────
  private loadAdminData() {
    this.activities = [
      { id: '1', message: 'قام بإضافة مستخدم جديد: محمد إبراهيم', time: 'منذ 5 دقائق', dotColor: 'bg-[var(--purple)]' },
      { id: '2', message: 'قام بتعديل صلاحيات المساعد: فاطمة أحمد', time: 'منذ ساعة', dotColor: 'bg-[var(--star)]' },
      { id: '3', message: 'قام بحذف درس: الفيزياء الكهربائية', time: 'منذ 3 ساعات', dotColor: 'bg-[var(--coral)]' },
      { id: '4', message: 'قام بإنشاء تقرير شهري للمنصة', time: 'منذ يوم', dotColor: 'bg-[var(--mint)]' },
      { id: '5', message: 'قام بتحديث إعدادات المنصة', time: 'منذ يومين', dotColor: 'bg-[var(--purple)]' },
      { id: '6', message: 'قام بمراجعة طلبات التسجيل الجديدة', time: 'منذ 3 أيام', dotColor: 'bg-[var(--star)]' },
    ];

    this.loginRecords = [
      { id: '1', ip: '156.204.11.42', device: 'Chrome / Windows 11', time: '2025-07-07 14:32', location: 'القاهرة، مصر' },
      { id: '2', ip: '156.204.11.42', device: 'Chrome / Windows 11', time: '2025-07-06 09:15', location: 'القاهرة، مصر' },
      { id: '3', ip: '197.53.88.12', device: 'Safari / iPhone 15', time: '2025-07-05 18:45', location: 'الإسكندرية، مصر' },
    ];

    this.stats = [
      { label: 'المستخدمين', value: '٢٤', color: 'text-[var(--purple-lt)]' },
      { label: 'المعلمين', value: '٨', color: 'text-[var(--mint)]' },
      { label: 'الطلاب', value: '١٢٠', color: 'text-[var(--star)]' },
      { label: 'الدروس', value: '٤٥', color: 'text-[var(--coral)]' },
    ];
  }

  // ── Teacher Data ────────────────────────────────────────────────────────────
  private loadTeacherData() {
    this.lessons = [
      { id: '1', title: 'الفيزياء الكهربائية', method: 'اشتراك ذاتي', progress: 85, status: 'نشط', statusColor: 'bg-[rgba(78,203,141,0.16)] text-[var(--mint)]', progressColor: 'bg-[var(--mint)]' },
      { id: '2', title: 'الميكانيكا الحرارية', method: 'اشتراك ذاتي', progress: 60, status: 'نشط', statusColor: 'bg-[rgba(78,203,141,0.16)] text-[var(--mint)]', progressColor: 'bg-[var(--star)]' },
      { id: '3', title: 'الضوء والبصريات', method: 'منح من المعلم', grantedBy: 'أحمد محمد', progress: 30, status: 'جديد', statusColor: 'bg-[rgba(147,112,219,0.16)] text-[var(--purple-lt)]', progressColor: 'bg-[var(--coral)]' },
      { id: '4', title: 'الذرة والنواة', method: 'اشتراك ذاتي', progress: 100, status: 'مكتمل', statusColor: 'bg-[rgba(59,130,246,0.16)] text-[var(--blue)]', progressColor: 'bg-[var(--mint)]' },
    ];

    this.students = [
      { id: '3', name: 'محمد إبراهيم حسن', grade: 'الصف الثاني الثانوي', lessonsCount: 5, avgQuiz: 78, active: true },
      { id: '7', name: 'يوسف علي أحمد', grade: 'الصف الأول الثانوي', lessonsCount: 3, avgQuiz: 65, active: false },
      { id: '10', name: 'هدى محمد سعيد', grade: 'الصف الثالث الثانوي', lessonsCount: 7, avgQuiz: 92, active: true },
      { id: '13', name: 'سامي خالد محمود', grade: 'الصف الثاني الثانوي', lessonsCount: 4, avgQuiz: 71, active: true },
      { id: '17', name: 'علي إبراهيم سامي', grade: 'الصف الأول الثانوي', lessonsCount: 2, avgQuiz: 58, active: true },
    ];

    this.assistants = [
      { id: '4', name: 'فاطمة أحمد محمود', email: 'fatima.a@gmail.com', active: false },
      { id: '8', name: 'نورا خالد سامي', email: 'noura.k@gmail.com', active: true },
      { id: '14', name: 'دينا أحمد فؤاد', email: 'dina.a@gmail.com', active: true },
    ];

    this.activities = [
      { id: '1', message: 'قام بإضافة درس جديد: الذرة والنواة', time: 'منذ ساعة', dotColor: 'bg-[var(--purple)]' },
      { id: '2', message: 'قام بتصحيح كويز: الفيزياء الكهربائية', time: 'منذ 3 ساعات', dotColor: 'bg-[var(--mint)]' },
      { id: '3', message: 'قام بمنح درس للطالب: محمد إبراهيم', time: 'منذ 5 ساعات', dotColor: 'bg-[var(--star)]' },
      { id: '4', message: 'قام بإرسال تقرير لولي أمر: يوسف علي', time: 'منذ يوم', dotColor: 'bg-[var(--purple)]' },
      { id: '5', message: 'قام بتحديث محتوى درس: الميكانيكا الحرارية', time: 'منذ يومين', dotColor: 'bg-[var(--blue)]' },
    ];

    this.stats = [
      { label: 'الدروس', value: '٤', color: 'text-[var(--purple-lt)]' },
      { label: 'الطلاب', value: '٥', color: 'text-[var(--mint)]' },
      { label: 'المساعدين', value: '٣', color: 'text-[var(--star)]' },
      { label: 'متوسط الكويزات', value: '٧٣٪', color: 'text-[var(--coral)]' },
    ];
  }

  // ── Student Data ────────────────────────────────────────────────────────────
  private loadStudentData() {
    this.lessons = [
      { id: '1', title: 'الفيزياء الكهربائية', method: 'اشتراك ذاتي', progress: 85, status: 'نشط', statusColor: 'bg-[rgba(78,203,141,0.16)] text-[var(--mint)]', progressColor: 'bg-[var(--mint)]' },
      { id: '2', title: 'الميكانيكا الحرارية', method: 'منح من المعلم', grantedBy: 'سارة خالد', progress: 60, status: 'نشط', statusColor: 'bg-[rgba(78,203,141,0.16)] text-[var(--mint)]', progressColor: 'bg-[var(--star)]' },
      { id: '3', title: 'الضوء والبصريات', method: 'اشتراك ذاتي', progress: 30, status: 'جديد', statusColor: 'bg-[rgba(147,112,219,0.16)] text-[var(--purple-lt)]', progressColor: 'bg-[var(--coral)]' },
      { id: '4', title: 'الذرة والنواة', method: 'منح من المعلم', grantedBy: 'سارة خالد', progress: 100, status: 'مكتمل', statusColor: 'bg-[rgba(59,130,246,0.16)] text-[var(--blue)]', progressColor: 'bg-[var(--mint)]' },
      { id: '5', title: 'الموجات والصوت', method: 'اشتراك ذاتي', progress: 45, status: 'نشط', statusColor: 'bg-[rgba(78,203,141,0.16)] text-[var(--mint)]', progressColor: 'bg-[var(--star)]' },
    ];

    this.quizzes = [
      { id: '1', title: 'كويز الفيزياء الكهربائية - الوحدة الأولى', score: 18, maxScore: 20, date: '2025-07-01', status: 'ممتاز', statusColor: 'bg-[rgba(78,203,141,0.16)] text-[var(--mint)]' },
      { id: '2', title: 'كويز الميكانيكا الحرارية', score: 14, maxScore: 20, date: '2025-06-28', status: 'جيد', statusColor: 'bg-[rgba(245,158,11,0.16)] text-[var(--star)]' },
      { id: '3', title: 'كويز الضوء والبصريات', score: 8, maxScore: 20, date: '2025-06-20', status: 'ضعيف', statusColor: 'bg-[rgba(239,68,68,0.16)] text-[var(--coral)]' },
      { id: '4', title: 'كويز الذرة والنواة', score: 20, maxScore: 20, date: '2025-06-15', status: 'ممتاز', statusColor: 'bg-[rgba(78,203,141,0.16)] text-[var(--mint)]' },
    ];

    this.activities = [
      { id: '1', message: 'أكمل كويز: الفيزياء الكهربائية', time: 'منذ يومين', dotColor: 'bg-[var(--mint)]' },
      { id: '2', message: 'شاهد درس: الميكانيكا الحرارية - الجزء 3', time: 'منذ 3 أيام', dotColor: 'bg-[var(--purple)]' },
      { id: '3', message: 'حل واجب: الضوء والبصريات', time: 'منذ 4 أيام', dotColor: 'bg-[var(--star)]' },
      { id: '4', message: 'اشترك في درس: الموجات والصوت', time: 'منذ أسبوع', dotColor: 'bg-[var(--blue)]' },
      { id: '5', message: 'أكمل كويز: الذرة والنواة', time: 'منذ أسبوعين', dotColor: 'bg-[var(--mint)]' },
    ];

    this.stats = [
      { label: 'الدروس', value: '٥', color: 'text-[var(--purple-lt)]' },
      { label: 'الكويزات', value: '٤', color: 'text-[var(--mint)]' },
      { label: 'متوسط الكويزات', value: '٧٥٪', color: 'text-[var(--star)]' },
      { label: 'الدروس المكتملة', value: '١', color: 'text-[var(--coral)]' },
    ];
  }

  // ── Assistant Data ────────────────────────────────────────────────────────────
  private loadAssistantData() {
    this.permissions = [
      { id: '1', name: 'إدارة الطلاب', description: 'إضافة وتعديل وحذف بيانات الطلاب', enabled: true },
      { id: '2', name: 'تصحيح الكويزات', description: 'تصحيح إجابات الكويزات وإعطاء الدرجات', enabled: true },
      { id: '3', name: 'إرسال التقارير', description: 'إرسال تقارير التقدم لأولياء الأمور', enabled: true },
      { id: '4', name: 'إدارة الدروس', description: 'إضافة وتعديل محتوى الدروس', enabled: false },
      { id: '5', name: 'إدارة المستخدمين', description: 'إضافة وتعديل المستخدمين', enabled: false },
      { id: '6', name: 'الوصول للإحصائيات', description: 'عرض إحصائيات المنصة', enabled: true },
    ];

    this.activities = [
      { id: '1', message: 'قام بتصحيح كويز: الفيزياء الكهربائية', time: 'منذ ساعتين', dotColor: 'bg-[var(--mint)]' },
      { id: '2', message: 'قام بإرسال تقرير لولي أمر: محمد إبراهيم', time: 'منذ 5 ساعات', dotColor: 'bg-[var(--purple)]' },
      { id: '3', message: 'قام بمراجعة واجب: الضوء والبصريات', time: 'منذ يوم', dotColor: 'bg-[var(--star)]' },
      { id: '4', message: 'قام بإضافة ملاحظة للطالب: يوسف علي', time: 'منذ يومين', dotColor: 'bg-[var(--blue)]' },
      { id: '5', message: 'قام بتحديث بيانات طالب: هدى محمد', time: 'منذ 3 أيام', dotColor: 'bg-[var(--purple)]' },
    ];

    this.stats = [
      { label: 'الصلاحيات', value: '٦', color: 'text-[var(--purple-lt)]' },
      { label: 'الصلاحيات المفعلة', value: '٤', color: 'text-[var(--mint)]' },
      { label: 'التقارير المرسلة', value: '١٢', color: 'text-[var(--star)]' },
      { label: 'الكويزات المصححة', value: '٤٥', color: 'text-[var(--coral)]' },
    ];
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  openRemoveModal(lesson: Lesson) {
    this.lessonToRemove = lesson;
    this.removeLessonModal = true;
    this.cdr.detectChanges();
  }

  confirmRemove() {
    if (this.lessonToRemove) {
      this.lessons = this.lessons.filter(l => l.id !== this.lessonToRemove!.id);
      this.lessonToRemove = null;
      this.removeLessonModal = false;
      this.cdr.detectChanges();
    }
  }

  closeRemoveModal() {
    this.removeLessonModal = false;
    this.lessonToRemove = null;
    this.cdr.detectChanges();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  getInitials(name: string): string {
    const p = name.trim().split(/\s+/);
    return p.length >= 2 ? p[0][0] + p[1][0] : p[0][0] || '';
  }

  get whatsappLink(): string {
    const num = this.user.parentPhone || this.user.phone || '';
    return `https://wa.me/2${num}`;
  }

  toAr(n: number | string): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  scoreClass(n: number): string {
    if (n >= 80) return 'text-[var(--mint)]';
    if (n >= 60) return 'text-[var(--star)]';
    return 'text-[var(--coral)]';
  }

  get roleLabel(): string {
    const map: Record<UserRole, string> = { Admin: 'مدير', Teacher: 'معلم', Student: 'طالب', Assistant: 'مساعد' };
    return map[this.user.role];
  }

  get roleColor(): string {
    const map: Record<UserRole, string> = { Admin: '#8b5cf6', Teacher: '#3b82f6', Student: '#4ecb8d', Assistant: '#f59e0b' };
    return map[this.user.role];
  }

  get roleBg(): string {
    const map: Record<UserRole, string> = { Admin: 'rgba(139,92,246,0.16)', Teacher: 'rgba(59,130,246,0.16)', Student: 'rgba(78,203,141,0.16)', Assistant: 'rgba(245,158,11,0.16)' };
    return map[this.user.role];
  }

  get isAdmin(): boolean { return this.user.role === 'Admin'; }
  get isTeacher(): boolean { return this.user.role === 'Teacher'; }
  get isStudent(): boolean { return this.user.role === 'Student'; }
  get isAssistant(): boolean { return this.user.role === 'Assistant'; }
}