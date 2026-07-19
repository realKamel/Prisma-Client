import {
  Component,
  HostListener,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AcademicYear,
  GradingListItem,
  GradingStatus,
  Lesson,
  QuizCreatePayload,
  QuizListItem,
  QuizStatus,
} from '../../../core/Models/Teacher/teacher-exams-model';
import {
  studentInitials,
} from '../../../core/pipes/arabic-numerals/arabic-numerals';
import { TeacherExamsService } from '../../../core/Services/teacher-exams-service';
import { ExamCreateComponent } from './exam-create/exam-create';
import {
  ExamGrading,
  GradeSubmitEvent,
  GradingContext,
  OverrideSubmitEvent,
} from './exam-grading/exam-grading';
import { DeleteExamComponent } from './delete-exam/delete-exam';
import { QuizScope } from '../../../core/enums/quiz-scope';
import { ToastService } from '../../../core/Services/toast-service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { buildPagesArray, totalPages } from '../../../Utils/pagination.utils';
import { Pagination } from '../../../Components/pagination/pagination';
import {
  AssignmentStatus,
  AssignmentSubmissionDetail,
  AssignmentSubmissionListItem,
} from '../../../core/Models/Teacher/assignment-model';
import { AssignmentService } from '../../../core/Services/assignment-service';
import {
  AssignmentGradeSubmitEvent,
  AssignmentGrading,
} from './assignment-grading/assignment-grading';
import { StorageService } from '../../../core/Services/storage-service';
import { DatePipe, DecimalPipe } from '@angular/common';

type ActiveTab = 'comprehensiveExam' | 'lessonQuiz' | 'examResults' | 'quizResults' | 'assignments';

@Component({
  selector: 'app-teacher-exams',

  imports: [
    DatePipe,
    FormsModule,
    ExamCreateComponent,
    DeleteExamComponent,
    Pagination,
    AssignmentGrading,
    ExamGrading,
    DecimalPipe
  ],
  templateUrl: './teacher-exams.html',
})
export class TeacherExamsComponent implements OnInit {
  private readonly svc = inject(TeacherExamsService);
  private readonly assignmentSvc = inject(AssignmentService);
  private readonly storageSvc = inject(StorageService);

  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly gradingModal = viewChild.required<ExamGrading>('gradingModal');
  readonly assignmentGradingModal = viewChild.required<AssignmentGrading>('assignmentGradingModal');

  private readonly searchInput$ = new Subject<string>();
  private readonly gradingSearchInput$ = new Subject<string>();
  private readonly assignmentsSearchInput$ = new Subject<string>();

  private readonly numberPipe = inject(DecimalPipe);
  readonly initials = studentInitials;

  // ── Quizzes data ──────────────────────────────────────────────
  quizzes = signal<QuizListItem[]>([]);
  lessons = signal<Lesson[]>([]);
  academicYears = signal<AcademicYear[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedQuizId = signal<number | null>(null);
  quizzesTotalCount = signal(0);
  quizzesPage = signal(1);
  quizzesPageSize = 20;

  // ── grading List data ──────────────────────────────────────────────
  gradingList = signal<GradingListItem[]>([]);
  gradingTotalCount = signal(0);
  gradingPage = signal(1);
  gradingPageSize = 20;
  gradingLoading = signal(false);
  gradingSearch = signal('');
  gradingStatusFilter = signal<'all' | GradingStatus>('all');

  // ── grading modal data─────────────────────────────────────────────
  showGradingModal = signal(false);
  gradingContext = signal<GradingContext | null>(null);
  gradingAttemptLoading = signal(false);
  gradingSaving = signal(false);

  // ── Assignments data ──────────────────────────────────────────
  assignmentsList = signal<AssignmentSubmissionListItem[]>([]);
  assignmentsTotalCount = signal(0);
  assignmentsPage = signal(1);
  assignmentsPageSize = 20;
  assignmentsLoading = signal(false);
  assignmentsSearch = signal('');
  assignmentsLessonFilter = signal<number | null>(null);
  assignmentsStatusFilter = signal<'all' | AssignmentStatus>('all');

  // ── Assignment grading modal data ───────────────────────────────────
  showAssignmentGradingModal = signal(false);
  assignmentGradingItem = signal<AssignmentSubmissionListItem | null>(null);
  assignmentGradingDetail = signal<AssignmentSubmissionDetail | null>(null);
  assignmentGradingLoading = signal(false);
  assignmentGradingSaving = signal(false);

  // ── ui state ──────────────────────────────────────────
  activeTab = signal<ActiveTab>('comprehensiveExam');
  searchQuery = signal('');
  statusFilter = signal<'all' | QuizStatus>('all');

  showCreateModal = signal(false);
  showDeleteModal = signal(false);
  pendingDeleteId = signal<number | null>(null);
  pendingDeleteTitle = signal('');

  // ── computed ──────────────────────────────────────────────────
  quizzesTotalPages = computed(() => totalPages(this.quizzesTotalCount(), this.quizzesPageSize));
  gradingTotalPages = computed(() => totalPages(this.gradingTotalCount(), this.gradingPageSize));
  assignmentsTotalPages = computed(() =>
    totalPages(this.assignmentsTotalCount(), this.assignmentsPageSize),
  );

  quizzesPagesArray = computed(() =>
    buildPagesArray(this.quizzesTotalCount(), this.quizzesPageSize, this.quizzesPage()),
  );
  gradingPagesArray = computed(() =>
    buildPagesArray(this.gradingTotalCount(), this.gradingPageSize, this.gradingPage()),
  );
  assignmentsPagesArray = computed(() =>
    buildPagesArray(this.assignmentsTotalCount(), this.assignmentsPageSize, this.assignmentsPage()),
  );

  // ── KPI computed ──────────────────────────────────────────────
  isResultsTab = computed(
    () => this.activeTab() === 'examResults' || this.activeTab() === 'quizResults',
  );

  gradingKpis = computed(() => {
    const list = this.gradingList();
    const pending = list.filter((i) => i.status === 'submitted' && !i.heldForSecurityReview).length;
    const review = list.filter((i) => i.heldForSecurityReview).length;
    const graded = list.filter((i) => i.status === 'graded').length;
    const gradedWithScore = list.filter((i) => i.status === 'graded' && i.score !== null);
    const avgPct = gradedWithScore.length
      ? Math.round(
          gradedWithScore.reduce((s, i) => s + Math.round((i.score! / i.totalDegree) * 100), 0) /
            gradedWithScore.length,
        )
      : 0;
    return { pending, review, graded, avgPct, total: this.gradingTotalCount() };
  });

  assignmentsKpis = computed(() => {
    const list = this.assignmentsList();
    const pending = list.filter((i) => i.status === 'pending').length;
    const grading = list.filter((i) => i.status === 'grading').length;
    const graded = list.filter((i) => i.status === 'graded');
    const notSubmitted = list.filter((i) => i.status === 'not_submitted').length;

    const avgPct = graded.length
      ? Math.round(
          graded.reduce((s, i) => s + Math.round(((i.score ?? 0) / i.maxScore) * 100), 0) /
            graded.length,
        )
      : 0;

    return {
      total: this.assignmentsTotalCount(),
      pending,
      grading,
      gradedCount: graded.length,
      notSubmitted,
      avgPct,
    };
  });

  // ── lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this.svc.getAcademicYears().subscribe((d) => this.academicYears.set(d));
    this.svc.getLessons().subscribe((d) => this.lessons.set(d));
    this.loadQuizzes();

    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadQuizzes());

    this.gradingSearchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.gradingPage.set(1);
        this.loadGradingList();
      });

    this.assignmentsSearchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.assignmentsPage.set(1);
        this.loadAssignments();
      });
  }

  // ── Scope helpers ─────────────────────────────────────────────
  private currentScope(): number {
    return this.activeTab() === 'comprehensiveExam'
      ? QuizScope.ComprehensiveExam
      : QuizScope.LessonQuiz;
  }

  private gradingScope(): number {
    return this.activeTab() === 'examResults' ? QuizScope.ComprehensiveExam : QuizScope.LessonQuiz;
  }

  // ── data loading ──────────────────────────────────────
  loadQuizzes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.svc
      .getQuizzes(this.currentScope(), this.searchQuery(), this.statusFilter(), this.quizzesPage())
      .subscribe({
        next: (res) => {
          this.quizzes.set(res.items);
          this.quizzesTotalCount.set(res.totalCount);
          this.loading.set(false);
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء تحميل البيانات');
          this.loading.set(false);
        },
      });
  }

  loadGradingList(): void {
    this.gradingLoading.set(true);
    this.svc
      .getGradingList(
        this.gradingScope(),
        this.gradingPage(),
        this.gradingSearch(),
        this.gradingStatusFilter(),
        this.selectedQuizId() ?? undefined,
      )
      .subscribe({
        next: (res) => {
          this.gradingList.set(res.items);
          this.gradingTotalCount.set(res.totalCount);
          this.gradingLoading.set(false);
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء تحميل البيانات');
          this.gradingLoading.set(false);
        },
      });
  }

  loadAssignments(): void {
    this.assignmentsLoading.set(true);
    this.assignmentSvc
      .getAssignmentSubmissions(
        this.assignmentsPage(),
        this.assignmentsSearch(),
        this.assignmentsLessonFilter() ?? undefined,
        this.assignmentsStatusFilter(),
      )
      .subscribe({
        next: (res) => {
          this.assignmentsList.set(res.items);
          this.assignmentsTotalCount.set(res.totalCount);
          this.assignmentsLoading.set(false);
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء تحميل الواجبات');
          this.assignmentsLoading.set(false);
        },
      });
  }

  viewFile(objectKey: string): void {
    this.storageSvc.getDownloadUrl(objectKey).subscribe({
      next: (url) => window.open(url, '_blank'),
      error: () => this.toast.error('حدث خطأ أثناء فتح الملف'),
    });
  }

  // ── tabs ──────────────────────────────────────────────
  switchTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.statusFilter.set('all');

    // only first 2 tabs fetch quizzes
    if (tab === 'comprehensiveExam' || tab === 'lessonQuiz') {
      this.loadQuizzes();
    } else if (tab === 'examResults' || tab === 'quizResults') {
      this.gradingPage.set(1);
      this.gradingSearch.set('');
      this.gradingStatusFilter.set('all');
      this.loadGradingList();
    } else if (tab === 'assignments') {
      this.assignmentsPage.set(1);
      this.assignmentsSearch.set('');
      this.assignmentsLessonFilter.set(null);
      this.assignmentsStatusFilter.set('all');
      this.loadAssignments();
    }
  }

  isQuizTab(): boolean {
    return this.activeTab() === 'comprehensiveExam' || this.activeTab() === 'lessonQuiz';
  }

  viewQuizResults(quiz: QuizListItem): void {
    this.selectedQuizId.set(quiz.quizId);
    const target: ActiveTab =
      this.activeTab() === 'comprehensiveExam' ? 'examResults' : 'quizResults';
    this.switchTab(target);
  }

  // ── search & filter ───────────────────────────────────
  onSearch(): void {
    this.searchInput$.next(this.searchQuery());
  }

  onStatusFilter(status: 'all' | QuizStatus): void {
    this.statusFilter.set(status);
    this.gradingSearchInput$.next(this.gradingSearch());
  }

  goToQuizzesPage(page: number): void {
    if (page < 1 || page > this.quizzesTotalPages()) return;
    this.quizzesPage.set(page);
    this.loadQuizzes();
  }

  onGradingSearch(): void {
    this.gradingPage.set(1);
    this.gradingSearchInput$.next(this.gradingSearch());
  }

  onGradingStatusFilter(status: 'all' | GradingStatus): void {
    this.gradingStatusFilter.set(status);
    this.gradingPage.set(1);
    this.loadGradingList();
  }

  goToGradingPage(page: number): void {
    if (page < 1 || page > this.gradingTotalPages()) return;
    this.gradingPage.set(page);
    this.loadGradingList();
  }

  onAssignmentsSearch(): void {
    this.assignmentsSearchInput$.next(this.assignmentsSearch());
  }

  onAssignmentsLessonFilter(lessonId: number | null): void {
    this.assignmentsLessonFilter.set(lessonId);
    this.assignmentsPage.set(1);
    this.loadAssignments();
  }

  onAssignmentsStatusFilter(status: 'all' | AssignmentStatus): void {
    this.assignmentsStatusFilter.set(status);
    this.assignmentsPage.set(1);
    this.loadAssignments();
  }

  goToAssignmentsPage(page: number): void {
    if (page < 1 || page > this.assignmentsTotalPages()) return;
    this.assignmentsPage.set(page);
    this.loadAssignments();
  }

  // ── create modal ────────────────────────────────────────────
  openCreateModal(): void {
    this.showCreateModal.set(true);
  }
  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onQuizCreated(payload: QuizCreatePayload): void {
    this.svc.createQuiz(payload).subscribe({
      next: (newQuiz) => {
        this.quizzes.update((list) => [newQuiz, ...list]);
        this.showCreateModal.set(false);
        this.toast.success('تم إنشاء الاختبار بنجاح');
      },
      error: () => this.toast.error('حدث خطأ أثناء إنشاء الاختبار'),
    });
  }

  // ── Delete ────────────────────────────────────────────
  openDeleteModal(quiz: QuizListItem): void {
    this.pendingDeleteId.set(quiz.quizId);
    this.pendingDeleteTitle.set(quiz.title);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.svc.deleteQuiz(id).subscribe({
      next: () => {
        this.quizzes.update((list) => list.filter((q) => q.quizId !== id));
        this.showDeleteModal.set(false);
        this.toast.success('تم حذف الاختبار بنجاح');
      },
      error: () => this.toast.error('حدث خطأ أثناء الحذف'),
    });
  }

  // ── grading modal ────────────────────────────────────────────
  openGradingModal(item: GradingListItem): void {
    this.showGradingModal.set(true);
    this.gradingContext.set(null);
    this.gradingAttemptLoading.set(true);

    this.svc.getGradingAttempt(item.attemptId).subscribe({
      next: (attempt) => {
        const ctx: GradingContext = { item, attempt };
        this.gradingContext.set(ctx);
        // let the child component pre-fill its own local state
        this.gradingModal().initFromAttempt(attempt);
        this.gradingAttemptLoading.set(false);
      },
      error: () => {
        this.toast.error('حدث خطأ أثناء تحميل بيانات الاختبار');
        this.gradingAttemptLoading.set(false);
        this.showGradingModal.set(false);
      },
    });
  }

  closeGradingModal(): void {
    this.showGradingModal.set(false);
    this.gradingContext.set(null);
  }

  // ── Grade submission events from child ────────────────────────
  onGradeSubmitted(event: GradeSubmitEvent): void {
    this.gradingSaving.set(true);
    this.svc.submitGrade(event.attemptId, { grades: event.grades }).subscribe({
      next: (res) => {
        this.gradingSaving.set(false);
        this.showGradingModal.set(false);
        this.toast.success('تم حفظ التصحيح بنجاح');
        this.gradingList.update((list) =>
          list.map((item) =>
            item.attemptId !== event.attemptId
              ? item
              : {
                  ...item,
                  status: res.status as GradingStatus,
                  heldForSecurityReview: res.heldForSecurityReview,
                  pendingWrittenCount: 0,
                },
          ),
        );
      },
      error: () => {
        this.gradingSaving.set(false);
        this.toast.error('حدث خطأ أثناء حفظ التصحيح');
      },
    });
  }

  onOverrideSubmitted(event: OverrideSubmitEvent): void {
    this.gradingSaving.set(true);
    this.svc.overrideScore(event.attemptId, event.penaltyScore).subscribe({
      next: (res) => {
        this.gradingSaving.set(false);
        this.showGradingModal.set(false);
        this.toast.success('تم تعديل الدرجة بنجاح');
        this.gradingList.update((list) =>
          list.map((item) =>
            item.attemptId === event.attemptId
              ? { ...item, status: 'graded' as GradingStatus, score: res.finalScore }
              : item,
          ),
        );
      },
      error: () => {
        this.gradingSaving.set(false);
        this.toast.error('حدث خطأ أثناء تعديل الدرجة');
      },
    });
  }

  // ── assignments modal ────────────────────────────────────────────
  openAssignmentGradingModal(item: AssignmentSubmissionListItem): void {
    this.showAssignmentGradingModal.set(true);
    this.assignmentGradingItem.set(item);
    this.assignmentGradingDetail.set(null);
    this.assignmentGradingLoading.set(true);

    this.assignmentSvc.getAssignmentDetail(item.submissionId).subscribe({
      next: (detail) => {
        this.assignmentGradingDetail.set(detail);
        this.assignmentGradingModal().initFromDetail(detail);
        this.assignmentGradingLoading.set(false);
      },
      error: () => {
        this.toast.error('حدث خطأ أثناء تحميل بيانات الواجب');
        this.assignmentGradingLoading.set(false);
        this.showAssignmentGradingModal.set(false);
      },
    });
  }

  closeAssignmentGradingModal(): void {
    const detail = this.assignmentGradingDetail();
    if (detail) {
      this.assignmentSvc.releaseAssignmentLock(detail.submissionId).subscribe({
        error: () => {},
      });
      this.assignmentsList.update((list) =>
        list.map((i) =>
          i.submissionId !== detail.submissionId
            ? i
            : { ...i, isBeingGraded: false, gradingByUserName: null },
        ),
      );
    }

    this.showAssignmentGradingModal.set(false);
    this.assignmentGradingItem.set(null);
    this.assignmentGradingDetail.set(null);
  }

  onAssignmentGradeSubmitted(event: AssignmentGradeSubmitEvent): void {
    this.assignmentGradingSaving.set(true);
    this.assignmentSvc
      .gradeAssignment(event.submissionId, { score: event.score, note: event.note })
      .subscribe({
        next: () => {
          this.assignmentGradingSaving.set(false);
          this.toast.success('تم حفظ التصحيح بنجاح');

          this.assignmentsList.update((list) =>
            list.map((i) =>
              i.submissionId !== event.submissionId
                ? i
                : {
                    ...i,
                    status: 'graded' as AssignmentStatus,
                    score: event.score,
                    isBeingGraded: false,
                    gradingByUserName: null,
                  },
            ),
          );
          this.showAssignmentGradingModal.set(false);
          this.assignmentGradingItem.set(null);
          this.assignmentGradingDetail.set(null);
        },
        error: () => {
          this.assignmentGradingSaving.set(false);
          this.toast.error('حدث خطأ أثناء حفظ التصحيح');
        },
      });
  }

  // ── keyboard ──────────────────────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showCreateModal.set(false);
    this.showDeleteModal.set(false);
    this.showGradingModal.set(false);
    this.showAssignmentGradingModal.set(false);
  }

  // ── display helpers ───────────────────────────────────
  scoreClass(score: number | null): string {
    if (score === null) return 'text-[var(--muted)] text-[13px] font-semibold';
    if (score >= 80) return 'text-[var(--mint)] text-sm font-black';
    if (score >= 60) return 'text-[var(--star)] text-sm font-black';
    return 'text-[var(--coral)] text-sm font-black';
  }

  scoreText(score: number | null): string {
    return score === null ? '—' : `${this.numberPipe.transform(score)}٪`;
  }

  statusPillClass(s: QuizStatus): string {
    const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold';
    const map: Record<QuizStatus, string> = {
      active: 'bg-[color-mix(in_srgb,var(--purple-lt)_14%,transparent)] text-[var(--purple-lt)]',
      pending_grading: 'bg-[color-mix(in_srgb,var(--coral)_10%,transparent)] text-[var(--coral)]',
      completed: 'bg-[color-mix(in_srgb,var(--mint)_12%,transparent)] text-[var(--mint)]',
    };
    return `${base} ${map[s]}`;
  }

  statusDotClass(s: QuizStatus): string {
    const map: Record<QuizStatus, string> = {
      active: 'w-1.5 h-1.5 rounded-full bg-[var(--purple-lt)] animate-pulse',
      pending_grading: 'w-1.5 h-1.5 rounded-full bg-[var(--coral)] animate-pulse',
      completed: 'w-1.5 h-1.5 rounded-full bg-[var(--mint)]',
    };
    return map[s];
  }

  statusLabel(s: QuizStatus): string {
    const map: Record<QuizStatus, string> = {
      active: 'نشط',
      pending_grading: 'قيد التصحيح',
      completed: 'مكتمل',
    };
    return map[s];
  }

  readonly toTotalPending = (acc: number, q: QuizListItem) => acc + q.pendingGradingCount;
  readonly toTotalSubmitted = (acc: number, q: QuizListItem) => acc + q.submittedCount;

  avgScore(): number {
    const graded = this.quizzes().filter((q) => q.averageScore !== null);
    if (!graded.length) return 0;
    return Math.round(graded.reduce((s, q) => s + (q.averageScore ?? 0), 0) / graded.length);
  }

  gradingScoreText(item: GradingListItem): string {
    if (item.score === null) return '—';
    const pct = Math.round((item.score / item.totalDegree) * 100);
    return `${this.numberPipe.transform(pct)}٪`;
  }

  gradingScoreClass(item: GradingListItem): string {
    if (item.score === null) return 'text-[var(--muted)] text-[13px] font-semibold';
    const pct = Math.round((item.score / item.totalDegree) * 100);
    if (pct >= 80) return 'text-[var(--mint)] text-sm font-black';
    if (pct >= 60) return 'text-[var(--star)] text-sm font-black';
    return 'text-[var(--coral)] text-sm font-black';
  }

  needsReview(item: GradingListItem): boolean {
    return item.status === 'submitted' && item.heldForSecurityReview;
  }

  needsGrading(item: GradingListItem): boolean {
    return item.status === 'submitted' && !item.heldForSecurityReview;
  }

  assignmentScoreClass(item: AssignmentSubmissionListItem): string {
    const pct = Math.round((item.score! / item.maxScore) * 100);
    if (pct >= 80) return 'text-sm font-black text-(--mint)';
    if (pct >= 60) return 'text-sm font-black text-(--star)';
    return 'text-sm font-black text-(--coral)';
  }

  assignmentStatusLabel(status: AssignmentStatus): string {
    const map: Record<AssignmentStatus, string> = {
      not_submitted: 'لم يُسلَّم',
      pending: 'منتظر التصحيح',
      grading: 'قيد التصحيح',
      graded: 'مصحَّح',
    };
    return map[status];
  }

  assignmentStatusPillClass(status: AssignmentStatus): string {
    const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold';
    const map: Record<AssignmentStatus, string> = {
      not_submitted: 'bg-[color-mix(in_srgb,var(--muted)_10%,transparent)] text-(--muted)',
      pending: 'bg-[color-mix(in_srgb,var(--coral)_10%,transparent)] text-(--coral)',
      grading: 'bg-[color-mix(in_srgb,var(--star)_14%,transparent)] text-(--star)',
      graded: 'bg-[color-mix(in_srgb,var(--mint)_12%,transparent)] text-(--mint)',
    };
    return `${base} ${map[status]}`;
  }

  assignmentStatusDotClass(status: AssignmentStatus): string {
    const map: Record<AssignmentStatus, string> = {
      not_submitted: 'w-1.5 h-1.5 rounded-full bg-(--muted)',
      pending: 'w-1.5 h-1.5 rounded-full bg-(--coral) animate-pulse',
      grading: 'w-1.5 h-1.5 rounded-full bg-(--star) animate-pulse',
      graded: 'w-1.5 h-1.5 rounded-full bg-(--mint)',
    };
    return map[status];
  }
}
