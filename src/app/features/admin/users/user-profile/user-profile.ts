import { Component, OnInit, inject, signal, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import {
  UserEditData,
  Lesson,
  Activity,
  StatCard,
  RolePermission,
  RoleProfile,
} from '../../../../core/Models/Admin/User.model';
import { UserService } from '../../../../core/Services/user.service';
import { AppRole } from '../../../../core/enums/role-enum';

@Component({
  selector: 'app-user-profile',
  imports: [RouterModule, DecimalPipe],
  templateUrl: './user-profile.html',
})
export class UserProfileComponent implements OnInit {
  private userService = inject(UserService);

  // Router input binding automatically captures the ':id' parameter from the URL path
  readonly id = input<string>('');

  protected readonly user = signal<UserEditData>({
    id: '',
    firstName: '',
    secondName: null,
    thirdName: null,
    lastName: '',
    mobile: null,
    email: null,
    role: AppRole.STUDENT,
    gradeId: null,
    teacherIds: null,
    parentMobile: null,
    subject: null,
  });
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  // Conditional Data Sets
  protected readonly lessons = signal<Lesson[]>([]);
  protected readonly activities = signal<Activity[]>([]);
  protected readonly stats = signal<StatCard[]>([]);
  protected readonly teacherName = signal<string[] | null>(null);
  protected readonly permissions = signal<RolePermission[]>([]);

  // Modal State
  protected readonly removeLessonModal = signal(false);
  protected readonly lessonToRemove = signal<Lesson | null>(null);

  ngOnInit() {
    // If router input binding isn't active, you can fall back to: this.id()
    if (this.id()) {
      this.loadAllData();
    }
  }

  loadAllData() {
    this.loading.set(true);
    this.error.set('');

    this.userService.getUserById(this.id()).subscribe({
      next: (user) => {
        this.user.set(user);
        if (this.isStudent()) {
          this.loadStudentData();
        } else if (this.isTeacher()) {
          this.loadRoleProfile(this.userService.getTeacherProfile(this.id()));
        } else if (this.isAssistant()) {
          this.loadRoleProfile(this.userService.getAssistantProfile(this.id()));
        } else {
          this.loadRoleProfile(this.userService.getAdminProfile(this.id()));
        }
      },
      error: (err) => {
        console.error('Failed to load user', err);
        this.error.set('تعذر تحميل بيانات المستخدم.');
        this.loading.set(false);
      },
    });
  }

  private loadRoleProfile(source: Observable<RoleProfile>) {
    source.subscribe({
      next: (profile) => {
        this.stats.set(profile.stats);
        this.activities.set(profile.activities);
        this.permissions.set(profile.permissions ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load role profile', err);
        this.error.set('تعذر تحميل بيانات الملف الشخصي.');
        this.loading.set(false);
      },
    });
  }

  private loadStudentData() {
    const currentTeachersId = this.user().teacherIds;

    forkJoin({
      lessons: this.userService.getStudentLessons(this.id()),
      activities: this.userService.getStudentActivities(this.id()),
      stats: this.userService.getStudentStats(this.id()),
      teachers: currentTeachersId ? this.userService.getTeacherOptions() : of([]),
    }).subscribe({
      next: ({ lessons, activities, stats, teachers }) => {
        this.lessons.set(lessons);
        this.activities.set(activities);
        this.stats.set(stats);
        this.teacherName.set(teachers.filter((t) =>  currentTeachersId?.includes(t.id)).map(t=>t.name) ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load student profile data', err);
        this.error.set('تعذر تحميل بيانات الطالب.');
        this.loading.set(false);
      },
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  openRemoveModal(lesson: Lesson) {
    this.lessonToRemove.set(lesson);
    this.removeLessonModal.set(true);
  }

  confirmRemove() {
    const targetLesson = this.lessonToRemove();
    if (!targetLesson) return;

    this.userService.removeLessonAccess(this.id(), targetLesson.id).subscribe({
      next: () => {
        this.lessons.update((prev) => prev.filter((l) => l.id !== targetLesson.id));
        this.lessonToRemove.set(null);
        this.removeLessonModal.set(false);
      },
      error: (err) => {
        console.error('Failed to remove lesson access', err);
        alert('تعذرت إزالة وصول الدرس. حاول مرة أخرى.');
        this.closeRemoveModal();
      },
    });
  }

  closeRemoveModal() {
    this.removeLessonModal.set(false);
    this.lessonToRemove.set(null);
  }

  // ── Computed Signals (State Getters) ─────────────────────────────────────────
  protected readonly fullName = computed(() => {
    const u = this.user();
    return [u.firstName, u.secondName, u.thirdName, u.lastName].filter(Boolean).join(' ');
  });

  protected readonly whatsappLink = computed(() => {
    const u = this.user();
    const num = u.parentMobile || u.mobile || '';
    return `https://wa.me/2${num}`;
  });

  protected readonly roleLabel = computed(() => {
    const map: Record<AppRole, string> = {
      admin: 'مدير',
      teacher: 'معلم',
      student: 'طالب',
      assistant: 'مساعد',
      guest: 'غير مسجل',
    };
    return map[this.user().role];
  });

  protected readonly roleColor = computed(() => {
    const map: Record<AppRole, string> = {
      admin: '#8b5cf6',
      teacher: '#3b82f6',
      student: '#4ecb8d',
      assistant: '#f59e0b',
      guest: '#fdd',
    };
    return map[this.user().role];
  });

  protected readonly roleBg = computed(() => {
    const map: Record<AppRole, string> = {
      admin: 'rgba(139,92,246,0.16)',
      teacher: 'rgba(59,130,246,0.16)',
      student: 'rgba(78,203,141,0.16)',
      assistant: 'rgba(245,158,11,0.16)',
      guest: 'rgba(78,203,141,0.16)',
    };
    return map[this.user().role];
  });

  protected readonly isAdmin = computed(() => this.user().role === AppRole.ADMIN);
  protected readonly isTeacher = computed(() => this.user().role === AppRole.TEACHER);
  protected readonly isStudent = computed(() => this.user().role === AppRole.STUDENT);
  protected readonly isAssistant = computed(() => this.user().role === AppRole.ASSISTANT);

  // ── Standard Pure Helpers ───────────────────────────────────────────────────
  getInitials(name: string): string {
    const p = name.trim().split(/\s+/);
    return p.length >= 2 ? p[0][0] + p[1][0] : p[0][0] || '';
  }
}
