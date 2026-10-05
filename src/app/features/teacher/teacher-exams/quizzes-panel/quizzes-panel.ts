import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  debounced,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import { QuizScope } from '../../../../core/enums/quiz-scope';
import {
  QuizCreatePayload,
  QuizListItem,
  QuizStatus,
} from '../../../../core/Models/Teacher/teacher-exams-model';
import { TeacherExamsService } from '../../../../core/Services/teacher-exams-service';
import { CountUpDirective } from '../../../../shared/directives/count-up/count-up.directive';
import { buildPagesArray, totalPages } from '../../../../Utils/pagination.utils';
import { Pagination } from '../../../common/components/pagination/pagination';
import { DeleteExamComponent } from '../delete-exam/delete-exam';
import { ExamCreateComponent } from '../exam-create/exam-create';
import { GradingHeaderComponent } from '../grading-header/grading-header';
import { TeacherExamsStore } from '../teacher-exams-store';

type QuizStatusFilter = 'all' | QuizStatus;

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Lists the quizzes of one scope (comprehensive exams or lesson quizzes) and
 * owns the "create quiz" / "delete quiz" modals plus this tab's KPI strip.
 *
 * `scope` is supplied by the route `data` through `withComponentInputBinding`.
 */
@Component({
  selector: 'app-quizzes-panel',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    NgIcon,
    NgmMotionDirective,
    Pagination,
    ExamCreateComponent,
    DeleteExamComponent,
    GradingHeaderComponent,
    CountUpDirective,
  ],
  templateUrl: './quizzes-panel.html',
  providers: [DecimalPipe],
  viewProviders: [provideIcons({ lucideChevronDown })],
  host: { '(document:keydown.escape)': 'closeModals()' },
})
export class QuizzesPanelComponent implements OnInit {
  private readonly svc = inject(TeacherExamsService);
  private readonly store = inject(TeacherExamsStore);
  private readonly router = inject(Router);
  private readonly numberPipe = inject(DecimalPipe);

  /** Route data — which scope this tab lists. */
  public readonly scope = input.required<number>();

  protected readonly QuizScope = QuizScope;
  protected readonly isExamScope = computed(() => this.scope() === QuizScope.ComprehensiveExam);

  // ── filters ────────────────────────────────────────────────────
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<QuizStatusFilter>('all');
  protected readonly page = signal(1);

  /** Debounced mirror of {@link searchQuery} that the request actually reads. */
  private readonly appliedSearch = signal('');
  private readonly debouncedSearch = debounced(this.searchQuery, SEARCH_DEBOUNCE_MS);

  // ── data ───────────────────────────────────────────────────────
  protected readonly quizzesResource = rxResource({
    params: () => ({
      scope: this.scope(),
      page: this.page(),
      search: this.appliedSearch(),
      status: this.statusFilter(),
    }),
    stream: ({ params }) =>
      this.svc.getQuizzes(params.scope, params.search, params.status, params.page),
  });

  protected readonly quizzes = computed<QuizListItem[]>(
    () => this.quizzesResource.value()?.items ?? [],
  );
  protected readonly totalCount = computed(() => this.quizzesResource.value()?.totalCount ?? 0);
  protected readonly loading = this.quizzesResource.isLoading;
  protected readonly hasError = computed(() => this.quizzesResource.status() === 'error');

  protected readonly lessons = this.store.lessons;
  protected readonly academicYears = this.store.academicYears;

  // ── KPI strip ──────────────────────────────────────────────────
  protected readonly totalPending = computed(() =>
    this.quizzes().reduce((sum, quiz) => sum + quiz.pendingGradingCount, 0),
  );
  protected readonly totalSubmitted = computed(() =>
    this.quizzes().reduce((sum, quiz) => sum + quiz.submittedCount, 0),
  );
  protected readonly averageScore = computed(() => {
    const graded = this.quizzes().filter((quiz) => quiz.averageScore !== null);
    if (!graded.length) return 0;
    return Math.round(
      graded.reduce((sum, quiz) => sum + (quiz.averageScore ?? 0), 0) / graded.length,
    );
  });

  // ── pagination ─────────────────────────────────────────────────
  protected readonly totalPagesCount = computed(() => totalPages(this.totalCount(), PAGE_SIZE));
  protected readonly pagesArray = computed(() =>
    buildPagesArray(this.totalCount(), PAGE_SIZE, this.page()),
  );

  // ── modals ─────────────────────────────────────────────────────
  protected readonly showCreateModal = signal(false);
  protected readonly showDeleteModal = signal(false);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly pendingDeleteTitle = signal('');

  constructor() {
    // Apply the debounced query to the request. `untracked` keeps this effect
    // watching ONLY the debounced value, so writing the page/filter signals
    // (which the resource also reads) can never re-trigger it.
    effect(() => {
      if (this.debouncedSearch.status() !== 'resolved') return;
      const settled = this.debouncedSearch.value() ?? '';
      untracked(() => {
        if (settled === this.appliedSearch()) return;
        this.appliedSearch.set(settled);
        this.page.set(1);
      });
    });
  }

  ngOnInit(): void {
    this.store.loadLookups();
  }

  // ── filters & pagination ───────────────────────────────────────
  protected onStatusFilter(status: QuizStatusFilter): void {
    this.statusFilter.set(status);
    this.page.set(1);
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPagesCount()) return;
    this.page.set(page);
  }

  /** Re-fetches the current view: resets to page 1 when we're not already there. */
  private refresh(): void {
    if (this.page() === 1) this.quizzesResource.reload();
    else this.page.set(1);
  }

  // ── navigation ─────────────────────────────────────────────────
  protected viewResults(quiz: QuizListItem): void {
    const target = this.isExamScope() ? 'exam-results' : 'quiz-results';
    void this.router.navigate(['/dashboard/grading', target], {
      queryParams: { quizId: quiz.quizId },
    });
  }

  // ── create modal ───────────────────────────────────────────────
  protected openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  protected onQuizCreated(payload: QuizCreatePayload): void {
    this.svc.createQuiz(payload).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        toast.success('تم إنشاء الاختبار بنجاح');
        this.refresh();
      },
      error: () => toast.error('حدث خطأ أثناء إنشاء الاختبار'),
    });
  }

  // ── delete modal ───────────────────────────────────────────────
  protected openDeleteModal(quiz: QuizListItem): void {
    this.pendingDeleteId.set(quiz.quizId);
    this.pendingDeleteTitle.set(quiz.title);
    this.showDeleteModal.set(true);
  }

  protected cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
  }

  protected confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;

    this.svc.deleteQuiz(id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.pendingDeleteId.set(null);
        toast.success('تم حذف الاختبار بنجاح');
        this.refresh();
      },
      error: () => toast.error('حدث خطأ أثناء الحذف'),
    });
  }

  protected closeModals(): void {
    this.showCreateModal.set(false);
    this.showDeleteModal.set(false);
  }

  // ── display helpers ────────────────────────────────────────────
  protected scoreClass(score: number | null): string {
    if (score === null) return 'text-muted text-[13px] font-semibold';
    if (score >= 80) return 'text-mint text-sm font-black';
    if (score >= 60) return 'text-star text-sm font-black';
    return 'text-coral text-sm font-black';
  }

  protected scoreText(score: number | null): string {
    return score === null ? '—' : `${this.numberPipe.transform(score)}٪`;
  }

  protected statusPillClass(status: QuizStatus): string {
    const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold';
    const map: Record<QuizStatus, string> = {
      active:
        'bg-[color-mix(in_srgb,var(--color-primary-light)_14%,transparent)] text-primary-light',
      pending_grading: 'bg-[color-mix(in_srgb,var(--color-coral)_10%,transparent)] text-coral',
      completed: 'bg-[color-mix(in_srgb,var(--color-mint)_12%,transparent)] text-mint',
    };
    return `${base} ${map[status]}`;
  }

  protected statusDotClass(status: QuizStatus): string {
    const map: Record<QuizStatus, string> = {
      active: 'w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse',
      pending_grading: 'w-1.5 h-1.5 rounded-full bg-coral animate-pulse',
      completed: 'w-1.5 h-1.5 rounded-full bg-mint',
    };
    return map[status];
  }

  protected statusLabel(status: QuizStatus): string {
    const map: Record<QuizStatus, string> = {
      active: 'نشط',
      pending_grading: 'قيد التصحيح',
      completed: 'مكتمل',
    };
    return map[status];
  }
}
