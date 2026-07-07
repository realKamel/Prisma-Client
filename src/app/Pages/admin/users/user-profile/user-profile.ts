import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import {
  User, UserRole, Lesson, Quiz, Activity, LoginRecord, Permission,
  StudentSummary, AssistantSummary, TeacherSummary, StatCard,
} from '../../../../core/Models/Admin/User.model';
import { UserService } from '../../../../core/Services/user.service';

// ── Component ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.html',
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  userId = '';
  user: User = {
    id: 0, firstName: '', secondName: '', thirdName: '', lastName: '',
    name: '', email: '', mobile: '', role: 'Student', active: false,
    joined: '', lastActive: '',
  };
  loading = true;
  error = '';

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
    this.error = '';
    this.cdr.detectChanges();

    this.userService.getUserProfile(this.userId).subscribe({
      next: (profile) => {
        this.user = profile.user;
        this.stats = profile.stats || [];
        this.activities = profile.activities || [];
        this.loginRecords = profile.loginRecords || [];
        this.lessons = profile.lessons || [];
        this.students = profile.students || [];
        this.assistants = profile.assistants || [];
        this.quizzes = profile.quizzes || [];
        this.permissions = profile.permissions || [];
        this.teachers = profile.teachers || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
        this.error = 'تعذر تحميل بيانات المستخدم.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  openRemoveModal(lesson: Lesson) {
    this.lessonToRemove = lesson;
    this.removeLessonModal = true;
    this.cdr.detectChanges();
  }

  confirmRemove() {
    if (!this.lessonToRemove) return;
    const lessonId = this.lessonToRemove.id;

    this.userService.removeLessonAccess(this.userId, lessonId).subscribe({
      next: () => {
        this.lessons = this.lessons.filter(l => l.id !== lessonId);
        this.lessonToRemove = null;
        this.removeLessonModal = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to remove lesson access', err);
        alert('تعذرت إزالة وصول الدرس. حاول مرة أخرى.');
        this.closeRemoveModal();
      },
    });
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
    const num = this.user.parentMobile || this.user.mobile || '';
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