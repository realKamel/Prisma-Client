import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import {
  KpiTile,
  Teacher,
  TeacherFilters,
  TeacherStats,
  ToastState,
} from '../../../core/Models/Admin/teachers-admin.types';
import { TeachersService } from '../../../core/Services/teachers.service';
import { AdminToastComponent } from './admin-toast.component';
import { KpiStripComponent } from './kpi-strip.component';
import { SuspendModalComponent } from './suspend-modal.component/suspend-modal.component';
import { TeachersTableComponent } from './teachers-table.component/teachers-table.component';
import { TeachersToolbarComponent } from './teachers-toolbar.component/teachers-toolbar.component';

@Component({
  selector: 'app-teachers-admin-page',
  standalone: true,
  imports: [
    KpiStripComponent,
    TeachersToolbarComponent,
    TeachersTableComponent,
    SuspendModalComponent,
    AdminToastComponent,
  ],
  templateUrl: './teachers-admin-page.component.html',
})
export class TeachersAdminPageComponent implements OnInit, OnDestroy {
  private readonly teachersService = inject(TeachersService);

  readonly teachers = signal<Teacher[]>([]);
  readonly isLoading = signal(false);

  readonly stats = signal<TeacherStats | null>(null);
  readonly isLoadingStats = signal(false);

  readonly filters = signal<TeacherFilters>({ query: '', status: 'all' });

  readonly suspendTarget = signal<Teacher | null>(null);

  readonly toast = signal<ToastState>({ message: '', warn: false });

  private toastTimer?: ReturnType<typeof setTimeout>;

  // 🌟 الكروت الإحصائية الأربعة (تتضمن إجمالي الطلاب)
  readonly kpiTiles = computed<KpiTile[]>(() => {
    const s = this.stats();
    const teachers = this.teachers();

    const activeCount = teachers.filter((t) => t.status === 'active').length;
    const revenueTotal = teachers.reduce((sum, t) => sum + t.revenue, 0);
    const studentsTotal = teachers.reduce((sum, t) => sum + t.students, 0);

    const totalDelta = s
      ? `↑ ${s.newTeachersThisMonth} جديد هذا الشهر`
      : 'إجمالي الحسابات المسجّلة';

    const revenueDelta = s
      ? `${s.revenueChangePercent >= 0 ? '↑' : '↓'} ${Math.abs(s.revenueChangePercent)}٪ عن الشهر الماضي`
      : 'إجمالي إيرادات المعلمين';

    return [
      {
        label: 'إجمالي المعلمين',
        value: s?.totalTeachers ?? teachers.length,
        delta: totalDelta,
        deltaUp: (s?.newTeachersThisMonth ?? 0) > 0,
        colorClass: 'border-t-2 border-t-primary',
      },
      {
        label: 'نشطون',
        value: s?.activeTeachers ?? activeCount,
        delta: 'يدرّس فعلياً الآن',
        deltaUp: true,
        colorClass: 'border-t-2 border-t-mint',
      },
      {
        label: 'إيرادات المنصة (الشهر)',
        value: s?.monthRevenue ?? revenueTotal,
        unit: 'جنيه',
        delta: revenueDelta,
        deltaUp: (s?.revenueChangePercent ?? 0) >= 0,
        colorClass: 'border-t-2 border-t-star',
      },
      {
        label: 'إجمالي الطلاب',
        value: s?.totalStudents ?? studentsTotal,
        unit: 'طالب',
        delta: 'إجمالي المسجلين بالمنصة',
        deltaUp: true,
        colorClass: 'border-t-2 border-t-coral',
      },
    ];
  });

  // ── Filtered teachers ──────────────────────────────────────
  readonly filteredTeachers = computed<Teacher[]>(() => {
    const q = this.filters().query.trim().toLowerCase();
    const status = this.filters().status;
    return this.teachers().filter((t) => {
      const matchQ =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        t.subject.toLowerCase().includes(q);
      const matchStatus = status === 'all' || t.status === status;
      return matchQ && matchStatus;
    });
  });

  ngOnInit(): void {
    this.loadTeachers();
    this.loadStats();
  }

  private loadTeachers(): void {
    this.isLoading.set(true);
    this.teachersService.getTeachers().subscribe({
      next: (teachers) => {
        this.teachers.set(teachers);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showToast('تعذّر تحميل بيانات المعلمين', true);
      },
    });
  }

  private loadStats(): void {
    this.isLoadingStats.set(true);
    this.teachersService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoadingStats.set(false);
      },
      error: () => {
        this.isLoadingStats.set(false);
      },
    });
  }

  onFiltersChange(filters: TeacherFilters): void {
    this.filters.set(filters);
  }

  // ── Suspend ───────────────────────────────────────────────────
  openSuspend(id: string): void {
    this.suspendTarget.set(this.teachers().find((t) => t.id === id) ?? null);
  }

  onSuspendConfirmed(event: { teacher: Teacher; reason: string }): void {
    this.teachersService.suspendTeacher(event.teacher.id, event.reason).subscribe({
      next: () => {
        this.teachers.update((teachers) =>
          teachers.map((t) => (t.id === event.teacher.id ? { ...t, status: 'suspended' } : t)),
        );
        this.suspendTarget.set(null);
        this.showToast(`تم إيقاف حساب ${event.teacher.name}`, true);
        this.loadStats();
      },
      error: () => {
        this.showToast('فشل إيقاف الحساب', true);
      },
    });
  }

  // ── Activate ──────────────────────────────────────────────────
  activateTeacher(id: string): void {
    const teacher = this.teachers().find((t) => t.id === id);
    if (!teacher) return;

    this.teachersService.activateTeacher(id).subscribe({
      next: () => {
        this.teachers.update((teachers) =>
          teachers.map((t) => (t.id === id ? { ...t, status: 'active' } : t)),
        );
        this.showToast(`تم تفعيل حساب ${teacher.name} بنجاح`);
        this.loadStats();
      },
      error: () => {
        this.showToast('فشل تفعيل الحساب', true);
      },
    });
  }
  private showToast(message: string, warn = false): void {
    clearTimeout(this.toastTimer);
    this.toast.set({ message, warn });
    this.toastTimer = setTimeout(() => {
      this.toast.set({ message: '', warn: false });
    }, 3000);
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }
}
