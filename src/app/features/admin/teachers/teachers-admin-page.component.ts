import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    CommonModule,
    KpiStripComponent,
    TeachersToolbarComponent,
    TeachersTableComponent,
    SuspendModalComponent,
    AdminToastComponent,
  ],
  templateUrl: './teachers-admin-page.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TeachersAdminPageComponent implements OnInit, OnDestroy {
  private readonly teachersService = inject(TeachersService);
  private readonly cdr = inject(ChangeDetectorRef); // 👈 1. حقن ChangeDetectorRef

  teachers: Teacher[] = [];
  isLoading = false;

  stats: TeacherStats | null = null;
  isLoadingStats = false;

  filters: TeacherFilters = { query: '', status: 'all' };

  suspendTarget: Teacher | null = null;

  toast: ToastState | null = null;
  private toastTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadTeachers();
    this.loadStats();
  }

  private loadTeachers(): void {
    this.isLoading = true;
    this.teachersService.getTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
        this.isLoading = false;
        this.cdr.detectChanges(); // 👈 2. تحديث فور استلام بيانات المعلمين
      },
      error: () => {
        this.isLoading = false;
        this.showToast('تعذّر تحميل بيانات المعلمين', true);
        this.cdr.detectChanges();
      },
    });
  }

  private loadStats(): void {
    this.isLoadingStats = true;
    this.teachersService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoadingStats = false;
        this.cdr.detectChanges(); // 👈 3. تحديث فور استلام الإحصائيات
      },
      error: () => {
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      },
    });
  }

  // 🌟 الكروت الإحصائية الأربعة (تتضمن إجمالي الطلاب)
  get kpiTiles(): KpiTile[] {
    const s = this.stats;

    const activeCount = this.teachers.filter((t) => t.status === 'active').length;
    const revenueTotal = this.teachers.reduce((sum, t) => sum + t.revenue, 0);
    const studentsTotal = this.teachers.reduce((sum, t) => sum + t.students, 0);

    const totalDelta = s
      ? `↑ ${s.newTeachersThisMonth} جديد هذا الشهر`
      : 'إجمالي الحسابات المسجّلة';

    const revenueDelta = s
      ? `${s.revenueChangePercent >= 0 ? '↑' : '↓'} ${Math.abs(s.revenueChangePercent)}٪ عن الشهر الماضي`
      : 'إجمالي إيرادات المعلمين';

    return [
      {
        label: 'إجمالي المعلمين',
        value: s?.totalTeachers ?? this.teachers.length,
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
        colorClass: 'border-t-2 border-t-[var(--star)]',
      },
      {
        label: 'إجمالي الطلاب',
        value: s?.totalStudents ?? studentsTotal,
        unit: 'طالب',
        delta: 'إجمالي المسجلين بالمنصة',
        deltaUp: true,
        colorClass: 'border-t-2 border-t-[var(--coral)]',
      },
    ];
  }

  // ── Filtered teachers ──────────────────────────────────────
  get filteredTeachers(): Teacher[] {
    const q = this.filters.query.trim().toLowerCase();
    return this.teachers.filter((t) => {
      const matchQ =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        t.subject.toLowerCase().includes(q);
      const matchStatus =
        this.filters.status === 'all' || t.status === this.filters.status;
      return matchQ && matchStatus;
    });
  }

  onFiltersChange(filters: TeacherFilters): void {
    this.filters = filters;
    this.cdr.detectChanges();
  }

  // ── Suspend ───────────────────────────────────────────────────
  openSuspend(id: string): void {
    this.suspendTarget = this.teachers.find((t) => t.id === id) ?? null;
    this.cdr.detectChanges();
  }

  onSuspendConfirmed(event: { teacher: Teacher; reason: string }): void {
    this.teachersService.suspendTeacher(event.teacher.id, event.reason).subscribe({
      next: () => {
        this.teachers = this.teachers.map((t) =>
          t.id === event.teacher.id ? { ...t, status: 'suspended' } : t
        );
        this.suspendTarget = null;
        this.showToast(`تم إيقاف حساب ${event.teacher.name}`, true);
        this.loadStats();
      },
      error: () => {
        this.showToast('فشل إيقاف الحساب', true);
        this.cdr.detectChanges();
      },
    });
  }

  // ── Activate ──────────────────────────────────────────────────
  activateTeacher(id: string): void {
    const teacher = this.teachers.find((t) => t.id === id);
    if (!teacher) return;

    this.teachersService.activateTeacher(id).subscribe({
      next: () => {
        this.teachers = this.teachers.map((t) =>
          t.id === id ? { ...t, status: 'active' } : t
        );
        this.showToast(`تم تفعيل حساب ${teacher.name} بنجاح`);
        this.loadStats();
      },
      error: () => {
        this.showToast('فشل تفعيل الحساب', true);
        this.cdr.detectChanges();
      },
    });
  }

  // ── Toast ─────────────────────────────────────────────────────
  private showToast(message: string, warn = false): void {
    clearTimeout(this.toastTimer);
    this.toast = { message, warn };
    this.cdr.detectChanges();
    this.toastTimer = setTimeout(() => {
      this.toast = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }
}
