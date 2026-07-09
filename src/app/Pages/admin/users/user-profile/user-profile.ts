import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import {
  UserEditData, UserRole, Lesson, Activity, StatCard, RolePermission, RoleProfile,
} from '../../../../core/Models/Admin/User.model';
import { UserService } from '../../../../core/Services/user.service';

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
  user: UserEditData = {
    id: '', firstName: '', secondName: null, thirdName: null, lastName: '',
    mobile: null, email: null, role: 'Student', gradeId: null, teacherId: null,
    parentMobile: null,
  };
  loading = true;
  error = '';

  // Populated for Student only
  lessons: Lesson[] = [];
  activities: Activity[] = [];
  stats: StatCard[] = [];
  teacherName: string | null = null;
  permissions: RolePermission[] = [];

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

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        if (this.isStudent) {
          this.loadStudentData();
        } else if (this.isTeacher) {
          this.loadRoleProfile(this.userService.getTeacherProfile(this.userId));
        } else if (this.isAssistant) {
          this.loadRoleProfile(this.userService.getAssistantProfile(this.userId));
        } else {
          this.loadRoleProfile(this.userService.getAdminProfile(this.userId));
        }
      },
      error: (err) => {
        console.error('Failed to load user', err);
        this.error = 'تعذر تحميل بيانات المستخدم.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadRoleProfile(source: Observable<RoleProfile>) {
    source.subscribe({
      next: (profile) => {
        this.stats = profile.stats;
        this.activities = profile.activities;
        this.permissions = profile.permissions ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load role profile', err);
        this.error = 'تعذر تحميل بيانات الملف الشخصي.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadStudentData() {
    forkJoin({
      lessons: this.userService.getStudentLessons(this.userId),
      activities: this.userService.getStudentActivities(this.userId),
      stats: this.userService.getStudentStats(this.userId),
      teachers: this.user.teacherId
        ? this.userService.getTeacherOptions()
        : of([]),
    }).subscribe({
      next: ({ lessons, activities, stats, teachers }) => {
        this.lessons = lessons;
        this.activities = activities;
        this.stats = stats;
        this.teacherName = teachers.find(t => t.id === this.user.teacherId)?.name ?? null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load student profile data', err);
        this.error = 'تعذر تحميل بيانات الطالب.';
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
  get fullName(): string {
    return [this.user.firstName, this.user.secondName, this.user.thirdName, this.user.lastName]
      .filter(Boolean).join(' ');
  }

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