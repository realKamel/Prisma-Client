import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  debounced,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import {
  GradeSubmitEvent,
  GradingContext,
  GradingListItem,
  GradingStatus,
  OverrideSubmitEvent,
} from '../../../../core/Models/Teacher/teacher-exams-model';
import { studentInitials } from '../../../../core/pipes/arabic-numerals/arabic-numerals';
import { TeacherExamsService } from '../../../../core/Services/teacher-exams-service';
import { buildPagesArray, totalPages } from '../../../../Utils/pagination.utils';
import { Pagination } from '../../../common/components/pagination/pagination';
import { ExamGrading } from '../exam-grading/exam-grading';
import { GradingHeaderComponent } from '../grading-header/grading-header';

type GradingStatusFilter = 'all' | GradingStatus;

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Lists grading attempts for one scope (comprehensive exams or lesson quizzes),
 * owns the grading modal and this tab's KPI strip.
 *
 * `scope` comes from the route `data`; `?quizId=` (set by the quizzes panel)
 * narrows the list to a single quiz.
 */
@Component({
  selector: 'app-grading-panel',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    NgIcon,
    NgmMotionDirective,
    Pagination,
    ExamGrading,
    GradingHeaderComponent,
  ],
  templateUrl: './grading-panel.html',
  providers: [DecimalPipe],
  viewProviders: [provideIcons({ lucideChevronDown })],
  host: { '(document:keydown.escape)': 'closeGradingModal()' },
})
export class GradingPanelComponent implements OnInit {
  private readonly svc = inject(TeacherExamsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly numberPipe = inject(DecimalPipe);

  /** Route data — which scope this tab lists. */
  public readonly scope = input.required<number>();

  protected readonly initials = studentInitials;
  protected readonly gradingModal = viewChild.required<ExamGrading>('gradingModal');

  // ── filters ────────────────────────────────────────────────────
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<GradingStatusFilter>('all');
  protected readonly page = signal(1);
  protected readonly quizId = signal<number | null>(this.readQuizId());

  /** Debounced mirror of {@link searchQuery} that the request actually reads. */
  private readonly appliedSearch = signal('');
  private readonly debouncedSearch = debounced(this.searchQuery, SEARCH_DEBOUNCE_MS);

  // ── data ───────────────────────────────────────────────────────
  protected readonly gradingResource = rxResource({
    params: () => ({
      scope: this.scope(),
      page: this.page(),
      search: this.appliedSearch(),
      status: this.statusFilter(),
      quizId: this.quizId(),
    }),
    stream: ({ params }) =>
      this.svc.getGradingList(
        params.scope,
        params.page,
        params.search,
        params.status,
        params.quizId ?? undefined,
      ),
  });

  protected readonly gradingList = computed<GradingListItem[]>(
    () => this.gradingResource.value()?.items ?? [],
  );
  protected readonly totalCount = computed(() => this.gradingResource.value()?.totalCount ?? 0);
  protected readonly loading = this.gradingResource.isLoading;
  protected readonly hasError = computed(() => this.gradingResource.status() === 'error');
  protected readonly selectedQuizTitle = computed(() => this.gradingList()[0]?.quizTitle ?? '...');

  // ── KPI strip ──────────────────────────────────────────────────
  protected readonly kpis = computed(() => {
    const list = this.gradingList();
    const pending = list.filter((i) => i.status === 'submitted' && !i.heldForSecurityReview).length;
    const review = list.filter((i) => i.heldForSecurityReview).length;
    const graded = list.filter((i) => i.status === 'graded').length;
    const gradedWithScore = list.filter((i) => i.status === 'graded' && i.score !== null);
    const avgPct = gradedWithScore.length
      ? Math.round(
          gradedWithScore.reduce(
            (sum, i) => sum + Math.round((i.score! / i.totalDegree) * 100),
            0,
          ) / gradedWithScore.length,
        )
      : 0;

    return { pending, review, graded, avgPct, total: this.totalCount() };
  });

  // ── pagination ─────────────────────────────────────────────────
  protected readonly totalPagesCount = computed(() => totalPages(this.totalCount(), PAGE_SIZE));
  protected readonly pagesArray = computed(() =>
    buildPagesArray(this.totalCount(), PAGE_SIZE, this.page()),
  );

  // ── grading modal state ────────────────────────────────────────
  protected readonly showGradingModal = signal(false);
  protected readonly gradingContext = signal<GradingContext | null>(null);
  protected readonly gradingAttemptLoading = signal(false);
  protected readonly gradingSaving = signal(false);

  constructor() {
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
    // `?quizId=` may change without recreating the component (same route), so the
    // URL stays the source of truth for the single-quiz filter.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const raw = params.get('quizId');
      const next = raw ? Number(raw) : null;
      if (next === this.quizId()) return;
      this.quizId.set(next);
      this.page.set(1);
    });
  }

  private readQuizId(): number | null {
    const raw = this.route.snapshot.queryParamMap.get('quizId');
    return raw ? Number(raw) : null;
  }

  // ── filters & pagination ───────────────────────────────────────
  protected onStatusFilter(status: GradingStatusFilter): void {
    this.statusFilter.set(status);
    this.page.set(1);
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPagesCount()) return;
    this.page.set(page);
  }

  protected clearQuizFilter(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { quizId: null } });
  }

  // ── grading modal ──────────────────────────────────────────────
  protected openGradingModal(item: GradingListItem): void {
    this.showGradingModal.set(true);
    this.gradingContext.set(null);
    this.gradingAttemptLoading.set(true);

    this.svc.getGradingAttempt(item.attemptId).subscribe({
      next: (attempt) => {
        this.gradingContext.set({ item, attempt });
        this.gradingModal().initFromAttempt(attempt);
        this.gradingAttemptLoading.set(false);
      },
      error: () => {
        toast.error('حدث خطأ أثناء تحميل بيانات الاختبار');
        this.gradingAttemptLoading.set(false);
        this.showGradingModal.set(false);
      },
    });
  }

  protected closeGradingModal(): void {
    this.showGradingModal.set(false);
    this.gradingContext.set(null);
  }

  protected onGradeSubmitted(event: GradeSubmitEvent): void {
    this.gradingSaving.set(true);
    this.svc.submitGrade(event.attemptId, { grades: event.grades }).subscribe({
      next: () => {
        this.gradingSaving.set(false);
        this.showGradingModal.set(false);
        toast.success('تم حفظ التصحيح بنجاح');
        this.gradingResource.reload();
      },
      error: () => {
        this.gradingSaving.set(false);
        toast.error('حدث خطأ أثناء حفظ التصحيح');
      },
    });
  }

  protected onOverrideSubmitted(event: OverrideSubmitEvent): void {
    this.gradingSaving.set(true);
    this.svc.overrideScore(event.attemptId, event.penaltyScore).subscribe({
      next: () => {
        this.gradingSaving.set(false);
        this.showGradingModal.set(false);
        toast.success('تم تعديل الدرجة بنجاح');
        this.gradingResource.reload();
      },
      error: () => {
        this.gradingSaving.set(false);
        toast.error('حدث خطأ أثناء تعديل الدرجة');
      },
    });
  }

  // ── display helpers ────────────────────────────────────────────
  protected gradingScoreText(item: GradingListItem): string {
    if (item.score === null) return '—';
    const pct = Math.round((item.score / item.totalDegree) * 100);
    return `${this.numberPipe.transform(pct)}٪`;
  }

  protected gradingScoreClass(item: GradingListItem): string {
    if (item.score === null) return 'text-muted text-[13px] font-semibold';
    const pct = Math.round((item.score / item.totalDegree) * 100);
    if (pct >= 80) return 'text-mint text-sm font-black';
    if (pct >= 60) return 'text-star text-sm font-black';
    return 'text-coral text-sm font-black';
  }

  protected needsReview(item: GradingListItem): boolean {
    return item.status === 'submitted' && item.heldForSecurityReview;
  }

  protected needsGrading(item: GradingListItem): boolean {
    return item.status === 'submitted' && !item.heldForSecurityReview;
  }
}
