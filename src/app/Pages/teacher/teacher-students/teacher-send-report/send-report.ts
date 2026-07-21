import { Component, computed, effect, inject, input, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeacherStudentsService } from '../../../../core/Services/teacher-students.service';
import { Student, ReportRequest } from '../../../../core/Models/Teacher/student.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-send-report',

  imports: [FormsModule, RouterModule, DecimalPipe],
  templateUrl: './send-report.html',
})
export class SendReport implements OnInit {
  private readonly service = inject(TeacherStudentsService);

  // Maps '?student=XYZ' from the URL via withComponentInputBinding()
  readonly student = input<string | null>(null);

  // Core Collection Signals
  readonly students = signal<Student[]>([]);
  readonly filteredList = signal<Student[]>([]);
  readonly selectedIds = signal<Set<string>>(new Set());

  // Loading & View Control Signals
  readonly loading = signal(true);
  readonly sending = signal(false);
  readonly showSuccess = signal(false);

  // Form Field State Signals
  readonly searchQuery = signal('');
  readonly reportType = model<'attendance' | 'grades' | 'progress'>('attendance');
  readonly dateFrom = signal('2026-05-01');
  readonly dateTo = signal('2026-06-03');

  readonly typeLabels: Record<string, string> = {
    attendance: 'تقرير حضور',
    grades: 'تقرير درجات',
    progress: 'تقرير تقدم عام',
  };

  readonly typeIncludes: Record<string, string[]> = {
    attendance: ['نسبة الحضور', 'عدد الجلسات الحاضرة', 'عدد الغيابات'],
    grades: ['متوسط درجات الكويزات', 'أعلى وأدنى درجة', 'المقارنة بمتوسط الفصل'],
    progress: ['نسبة الحضور', 'متوسط الدرجات', 'الدروس المكتملة', 'ملاحظات المعلمة'],
  };

  // Pure Computed Selectors (High Performance, No Manual Overhead)
  readonly allSelected = computed(() => {
    const list = this.filteredList();
    const selected = this.selectedIds();
    return list.length > 0 && list.every((s) => selected.has(s.id));
  });

  readonly previewNameStr = computed(() => {
    const ids = this.selectedIds();
    const allStudents = this.students();

    const names = [...ids]
      .slice(0, 2)
      .map((id) => {
        const s = allStudents.find((x) => x.id === id);
        return s ? s.name.split(' ')[0] : '';
      })
      .filter(Boolean);

    const more = ids.size > 2 ? ids.size - 2 : 0;
    return names.join('، ') + (more ? ` و${more} آخرين` : '');
  });

  constructor() {
    // Intercepts and binds the initial route param whenever the students list finishes loading
    effect(() => {
      const targetStudentId = this.student();
      const currentStudents = this.students();
      const isLoading = this.loading();

      if (targetStudentId && !isLoading && currentStudents.length > 0) {
        if (currentStudents.some((s) => s.id === targetStudentId)) {
          this.selectedIds.update((set) => {
            const newSet = new Set(set);
            newSet.add(targetStudentId);
            return newSet;
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.service.getStudents().subscribe({
      next: (res) => {
        this.students.set(res);
        this.filteredList.set([...res]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    const q = this.searchQuery().trim().toLowerCase();
    this.filteredList.set(
      q ? this.students().filter((s) => s.name.toLowerCase().includes(q)) : [...this.students()],
    );
  }

  toggleStudent(id: string): void {
    this.selectedIds.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  toggleSelectAll(): void {
    this.selectedIds.update((set) => {
      const newSet = new Set(set);
      if (this.allSelected()) {
        this.filteredList().forEach((s) => newSet.delete(s.id));
      } else {
        this.filteredList().forEach((s) => newSet.add(s.id));
      }
      return newSet;
    });
  }

  selectType(type: 'attendance' | 'grades' | 'progress'): void {
    this.reportType.set(type);
  }

  getInitials(name: string): string {
    const p = name.trim().split(' ');
    return p.length >= 2 ? p[0][0] + p[1][0] : p[0][0];
  }

  sendReport(): void {
    this.sending.set(true);

    const request: ReportRequest = {
      studentIds: [...this.selectedIds()],
      reportType: this.reportType(),
      dateFrom: this.dateFrom(),
      dateTo: this.dateTo(),
    };

    this.service.sendReport(request).subscribe({
      next: () => {
        this.sending.set(false);
        this.showSuccess.set(true);
      },
      error: () => this.sending.set(false),
    });
  }

  closeSuccess(): void {
    this.showSuccess.set(false);
    this.selectedIds.set(new Set());
    this.onSearch();
  }
}
