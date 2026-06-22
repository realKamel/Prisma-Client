import { Component, HostListener, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AcademicYear,
  AssignmentRow,
  ExamCreatePayload,
  ExamRow,
  GradeSavedEvent,
  GradingCategory,
  Lesson,
  SubmissionRow,
} from '../../../core/Models/Teacher/teacher-exams-model';
import { generateMockGradingQuestions } from '../../../core/stores/exam-mock-data/exam-mock-data';
import { toArabicNumerals, studentInitials } from '../../../core/pipes/arabic-numerals/arabic-numerals';
import { TeacherExamsService } from '../../../core/Services/teacher-exams-service';

import { ExamCreateComponent } from './exam-create/exam-create';
import { ExamGradingComponent, GradingContext } from './exam-grading/exam-grading';
import { DeleteExamComponent } from './delete-exam/delete-exam';

type ActiveTab = 'exams' | 'quiz' | 'results' | 'assign';

@Component({
  selector: 'app-teacher-exams',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ExamCreateComponent,
    ExamGradingComponent,
    DeleteExamComponent,
  ],
  templateUrl: './teacher-exams.html',
})
export class TeacherExamsComponent implements OnInit {
  private readonly svc = inject(TeacherExamsService);

  readonly toAr = toArabicNumerals;
  readonly initials = studentInitials;

  // ── data ──────────────────────────────────────────────
  exams = signal<ExamRow[]>([]);
  quizSubs = signal<SubmissionRow[]>([]);
  examSubs = signal<SubmissionRow[]>([]);
  assignments = signal<AssignmentRow[]>([]);
  lessons = signal<Lesson[]>([]);
  academicYears = signal<AcademicYear[]>([]);

  // ── ui state ──────────────────────────────────────────
  activeTab = signal<ActiveTab>('exams');
  searchQuery = signal('');
  statusFilter = signal<'all' | 'sent' | 'done'>('all');

  showCreateModal = signal(false);
  showDeleteModal = signal(false);
  pendingDeleteId = signal<number | null>(null);
  pendingDeleteTitle = signal('');

  showGradingModal = signal(false);
  gradingCtx = signal<GradingContext | null>(null);

  // ── computed ──────────────────────────────────────────
  filteredExams = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const sf = this.statusFilter();
    return this.exams().filter(
      (ex) => (!q || ex.title.includes(q)) && (sf === 'all' || ex.status === sf),
    );
  });

  quizPendingCount  = computed(() => this.quizSubs().filter((r) => r.status === 'pending').length);
  examPendingCount  = computed(() => this.examSubs().filter((r) => r.status === 'pending').length);
  assignPendingCount = computed(() => this.assignments().filter((r) => r.status === 'pending').length);

  totalPendingGrading = computed(
    () => this.quizPendingCount() + this.examPendingCount() + this.assignPendingCount(),
  );

  avgScore = computed(() => {
    const graded = [
      ...this.quizSubs().filter((r) => r.score !== null),
      ...this.examSubs().filter((r) => r.score !== null),
    ];
    if (!graded.length) return 0;
    return Math.round(graded.reduce((s, r) => s + (r.score ?? 0), 0) / graded.length);
  });

  autoGradedCount = computed(
    () =>
      this.quizSubs().filter((r) => r.status === 'auto').length +
      this.examSubs().filter((r) => r.status === 'auto').length,
  );

  // ── lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this.svc.getAcademicYears().subscribe((d) => this.academicYears.set(d));
    this.svc.getLessons().subscribe((d) => this.lessons.set(d));
    this.svc.getExams().subscribe((d) => this.exams.set(d));
    this.svc.getQuizSubmissions().subscribe((d) => this.quizSubs.set(d));
    this.svc.getExamSubmissions().subscribe((d) => this.examSubs.set(d));
    this.svc.getAssignments().subscribe((d) => this.assignments.set(d));
  }

  // ── tabs ──────────────────────────────────────────────
  /** Typed wrapper so the template doesn't need `as any` */
  switchTab(tab: string): void {
    this.activeTab.set(tab as ActiveTab);
  }

  // ── exam CRUD ─────────────────────────────────────────
  openCreateModal(): void { this.showCreateModal.set(true); }
  closeCreateModal(): void { this.showCreateModal.set(false); }

  onExamCreated(payload: ExamCreatePayload): void {
    this.svc.createExam(payload).subscribe((newExam) => {
      this.exams.update((list) => [newExam, ...list]);
      this.showCreateModal.set(false);
    });
  }

  openDeleteModal(exam: ExamRow): void {
    this.pendingDeleteId.set(exam.id);
    this.pendingDeleteTitle.set(exam.title);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.svc.deleteExam(id).subscribe(() => {
      this.exams.update((list) => list.filter((e) => e.id !== id));
      this.showDeleteModal.set(false);
    });
  }

  // ── grading ───────────────────────────────────────────
  openGrading(id: string, category: GradingCategory): void {
    const isAssign = category === 'assign';
    const row = isAssign
      ? this.assignments().find((r) => r.id === id)
      : category === 'quiz'
        ? this.quizSubs().find((r) => r.id === id)
        : this.examSubs().find((r) => r.id === id);
    if (!row) return;

    if (isAssign) {
      const a = row as AssignmentRow;
      this.gradingCtx.set({ id, category, studentName: a.student, contextLabel: a.lesson, submitted: a.submitted, fileName: a.file, fileSize: a.size });
    } else {
      const s = row as SubmissionRow;
      this.gradingCtx.set({ id, category, studentName: s.student, contextLabel: s.context, submitted: s.submitted, questions: generateMockGradingQuestions(category as 'quiz' | 'exam') });
    }
    this.showGradingModal.set(true);
  }

  closeGrading(): void { this.showGradingModal.set(false); }

  onGradeSaved(event: GradeSavedEvent): void {
    this.svc.saveGrade(event).subscribe(() => {
      if (event.category === 'quiz') {
        this.quizSubs.update((list) =>
          list.map((r) => r.id === event.id ? { ...r, score: event.score, status: 'graded' as const, pendingWritten: 0 } : r),
        );
      } else if (event.category === 'exam') {
        this.examSubs.update((list) =>
          list.map((r) => r.id === event.id ? { ...r, score: event.score, status: 'graded' as const, pendingWritten: 0 } : r),
        );
      } else {
        this.assignments.update((list) =>
          list.map((r) => r.id === event.id ? { ...r, score: event.score, status: 'graded' as const } : r),
        );
      }
    });
  }

  // ── keyboard ──────────────────────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showCreateModal.set(false);
    this.showGradingModal.set(false);
    this.showDeleteModal.set(false);
  }

  // ── display helpers ───────────────────────────────────
  scoreClass(score: number | null): string {
    if (score === null) return 'text-[var(--muted)] text-[13px] font-semibold';
    if (score >= 80) return 'text-[var(--mint)] text-sm font-black';
    if (score >= 60) return 'text-[var(--star)] text-sm font-black';
    return 'text-[var(--coral)] text-sm font-black';
  }

  scoreText(score: number | null): string {
    return score === null ? '—' : `${this.toAr(score)}٪`;
  }

  statusPillClass(s: string): string {
    const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold';
    const map: Record<string, string> = {
      sent:    'bg-[color-mix(in_srgb,var(--purple-lt)_14%,transparent)] text-[var(--purple-lt)]',
      done:    'bg-[color-mix(in_srgb,var(--mint)_14%,transparent)] text-[var(--mint)]',
      pending: 'bg-[color-mix(in_srgb,var(--coral)_10%,transparent)] text-[var(--coral)]',
      auto:    'bg-[color-mix(in_srgb,var(--purple-lt)_12%,transparent)] text-[var(--purple-lt)]',
      graded:  'bg-[color-mix(in_srgb,var(--mint)_12%,transparent)] text-[var(--mint)]',
    };
    return `${base} ${map[s] ?? ''}`;
  }

  statusDotClass(s: string): string {
    const map: Record<string, string> = {
      sent:    'w-1.5 h-1.5 rounded-full bg-[var(--purple-lt)] animate-pulse',
      done:    'w-1.5 h-1.5 rounded-full bg-[var(--mint)]',
      pending: 'w-1.5 h-1.5 rounded-full bg-[var(--coral)] animate-pulse',
      auto:    'w-1.5 h-1.5 rounded-full bg-[var(--purple-lt)]',
      graded:  'w-1.5 h-1.5 rounded-full bg-[var(--mint)]',
    };
    return map[s] ?? 'w-1.5 h-1.5 rounded-full bg-[var(--muted)]';
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      sent: 'مرسل', done: 'مكتمل', pending: 'قيد التصحيح', auto: 'تلقائي', graded: 'مصحَّح',
    };
    return map[s] ?? s;
  }

  canGrade(status: string): boolean {
    return status === 'pending';
  }

  qtypeLabels(types: string[]): { cls: string; label: string }[] {
    const map: Record<string, { cls: string; label: string }> = {
      mcq:     { cls: 'bg-[color-mix(in_srgb,var(--purple-lt)_12%,transparent)] text-[var(--purple-lt)]', label: 'MCQ' },
      tf:      { cls: 'bg-[color-mix(in_srgb,var(--star)_14%,transparent)] text-[var(--star)]',           label: 'صح/غلط' },
      written: { cls: 'bg-[color-mix(in_srgb,var(--coral)_10%,transparent)] text-[var(--coral)]',         label: 'كتابي' },
    };
    if (types.length > 2) return [{ cls: 'bg-[color-mix(in_srgb,var(--muted)_12%,transparent)] text-[var(--muted)]', label: 'مختلط' }];
    return types.map((t) => map[t] ?? { cls: '', label: t });
  }
}