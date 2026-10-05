import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  debounced,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import {
  AssignmentStatus,
  AssignmentSubmissionDetail,
  AssignmentSubmissionListItem,
} from '../../../../core/Models/Teacher/assignment-model';
import { AssignmentGradeSubmitEvent } from '../../../../core/Models/Teacher/teacher-exams-model';
import { studentInitials } from '../../../../core/pipes/arabic-numerals/arabic-numerals';
import { AssignmentService } from '../../../../core/Services/assignment-service';
import { StorageService } from '../../../../core/Services/storage-service';
import { CountUpDirective } from '../../../../shared/directives/count-up/count-up.directive';
import { buildPagesArray, totalPages } from '../../../../Utils/pagination.utils';
import { Pagination } from '../../../common/components/pagination/pagination';
import { AssignmentGradingComponent } from '../assignment-grading/assignment-grading';
import { GradingHeaderComponent } from '../grading-header/grading-header';
import { TeacherExamsStore } from '../teacher-exams-store';

type AssignmentStatusFilter = 'all' | AssignmentStatus;

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Lists assignment submissions, owns the assignment grading modal and this
 * tab's KPI strip.
 */
@Component({
  selector: 'app-assignments-panel',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    NgIcon,
    NgmMotionDirective,
    Pagination,
    AssignmentGradingComponent,
    GradingHeaderComponent,
    CountUpDirective,
  ],
  templateUrl: './assignments-panel.html',
  providers: [DecimalPipe],
  viewProviders: [provideIcons({ lucideChevronDown })],
  host: { '(document:keydown.escape)': 'closeAssignmentGradingModal()' },
})
export class AssignmentsPanelComponent implements OnInit {
  private readonly assignmentSvc = inject(AssignmentService);
  private readonly storageSvc = inject(StorageService);
  private readonly store = inject(TeacherExamsStore);

  protected readonly initials = studentInitials;
  protected readonly assignmentGradingModal =
    viewChild.required<AssignmentGradingComponent>('assignmentGradingModal');

  // ── filters ────────────────────────────────────────────────────
  protected readonly searchQuery = signal('');
  protected readonly lessonFilter = signal<number | null>(null);
  protected readonly statusFilter = signal<AssignmentStatusFilter>('all');
  protected readonly page = signal(1);

  /** Debounced mirror of {@link searchQuery} that the request actually reads. */
  private readonly appliedSearch = signal('');
  private readonly debouncedSearch = debounced(this.searchQuery, SEARCH_DEBOUNCE_MS);

  // ── data ───────────────────────────────────────────────────────
  protected readonly assignmentsResource = rxResource({
    params: () => ({
      page: this.page(),
      search: this.appliedSearch(),
      lessonId: this.lessonFilter(),
      status: this.statusFilter(),
    }),
    stream: ({ params }) =>
      this.assignmentSvc.getAssignmentSubmissions(
        params.page,
        params.search,
        params.lessonId ?? undefined,
        params.status,
      ),
  });

  protected readonly assignments = computed<AssignmentSubmissionListItem[]>(
    () => this.assignmentsResource.value()?.items ?? [],
  );
  protected readonly totalCount = computed(() => this.assignmentsResource.value()?.totalCount ?? 0);
  protected readonly loading = this.assignmentsResource.isLoading;
  protected readonly hasError = computed(() => this.assignmentsResource.status() === 'error');

  protected readonly lessons = this.store.lessons;

  // ── KPI strip ──────────────────────────────────────────────────
  protected readonly kpis = computed(() => {
    const list = this.assignments();
    const pending = list.filter((i) => i.status === 'pending').length;
    const grading = list.filter((i) => i.status === 'grading').length;
    const graded = list.filter((i) => i.status === 'graded');
    const notSubmitted = list.filter((i) => i.status === 'not_submitted').length;

    const avgPct = graded.length
      ? Math.round(
          graded.reduce((sum, i) => sum + Math.round(((i.score ?? 0) / i.maxScore) * 100), 0) /
            graded.length,
        )
      : 0;

    return {
      total: this.totalCount(),
      pending,
      grading,
      gradedCount: graded.length,
      notSubmitted,
      avgPct,
    };
  });

  // ── pagination ─────────────────────────────────────────────────
  protected readonly totalPagesCount = computed(() => totalPages(this.totalCount(), PAGE_SIZE));
  protected readonly pagesArray = computed(() =>
    buildPagesArray(this.totalCount(), PAGE_SIZE, this.page()),
  );

  // ── grading modal state ────────────────────────────────────────
  protected readonly showAssignmentGradingModal = signal(false);
  protected readonly assignmentGradingItem = signal<AssignmentSubmissionListItem | null>(null);
  protected readonly assignmentGradingDetail = signal<AssignmentSubmissionDetail | null>(null);
  protected readonly assignmentGradingLoading = signal(false);
  protected readonly assignmentGradingSaving = signal(false);

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
    this.store.loadLookups();
  }

  // ── filters & pagination ───────────────────────────────────────
  protected onLessonFilter(lessonId: number | null): void {
    this.lessonFilter.set(lessonId);
    this.page.set(1);
  }

  protected onStatusFilter(status: AssignmentStatusFilter): void {
    this.statusFilter.set(status);
    this.page.set(1);
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPagesCount()) return;
    this.page.set(page);
  }

  protected viewFile(objectKey: string): void {
    this.storageSvc.getDownloadUrl(objectKey).subscribe({
      next: (url) => window.open(url, '_blank'),
      error: () => toast.error('حدث خطأ أثناء فتح الملف'),
    });
  }

  // ── grading modal ──────────────────────────────────────────────
  protected openAssignmentGradingModal(item: AssignmentSubmissionListItem): void {
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
        toast.error('حدث خطأ أثناء تحميل بيانات الواجب');
        this.assignmentGradingLoading.set(false);
        this.showAssignmentGradingModal.set(false);
      },
    });
  }

  protected closeAssignmentGradingModal(): void {
    const detail = this.assignmentGradingDetail();
    if (detail) {
      this.assignmentSvc.releaseAssignmentLock(detail.submissionId).subscribe({ error: () => {} });
    }

    this.showAssignmentGradingModal.set(false);
    this.assignmentGradingItem.set(null);
    this.assignmentGradingDetail.set(null);
  }

  protected onAssignmentGradeSubmitted(event: AssignmentGradeSubmitEvent): void {
    this.assignmentGradingSaving.set(true);
    this.assignmentSvc
      .gradeAssignment(event.submissionId, { score: event.score, note: event.note })
      .subscribe({
        next: () => {
          this.assignmentGradingSaving.set(false);
          toast.success('تم حفظ التصحيح بنجاح');
          this.showAssignmentGradingModal.set(false);
          this.assignmentGradingItem.set(null);
          this.assignmentGradingDetail.set(null);
          this.assignmentsResource.reload();
        },
        error: () => {
          this.assignmentGradingSaving.set(false);
          toast.error('حدث خطأ أثناء حفظ التصحيح');
        },
      });
  }

  // ── display helpers ────────────────────────────────────────────
  protected assignmentScoreClass(item: AssignmentSubmissionListItem): string {
    const pct = Math.round((item.score! / item.maxScore) * 100);
    if (pct >= 80) return 'text-sm font-black text-mint';
    if (pct >= 60) return 'text-sm font-black text-star';
    return 'text-sm font-black text-coral';
  }

  protected assignmentStatusLabel(status: AssignmentStatus): string {
    const map: Record<AssignmentStatus, string> = {
      not_submitted: 'لم يُسلَّم',
      pending: 'منتظر التصحيح',
      grading: 'قيد التصحيح',
      graded: 'مصحَّح',
    };
    return map[status];
  }

  protected assignmentStatusPillClass(status: AssignmentStatus): string {
    const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold';
    const map: Record<AssignmentStatus, string> = {
      not_submitted: 'bg-[color-mix(in_srgb,var(--color-muted)_10%,transparent)] text-muted',
      pending: 'bg-[color-mix(in_srgb,var(--color-coral)_10%,transparent)] text-coral',
      grading: 'bg-[color-mix(in_srgb,var(--color-star)_14%,transparent)] text-star',
      graded: 'bg-[color-mix(in_srgb,var(--color-mint)_12%,transparent)] text-mint',
    };
    return `${base} ${map[status]}`;
  }

  protected assignmentStatusDotClass(status: AssignmentStatus): string {
    const map: Record<AssignmentStatus, string> = {
      not_submitted: 'w-1.5 h-1.5 rounded-full bg-muted',
      pending: 'w-1.5 h-1.5 rounded-full bg-coral animate-pulse',
      grading: 'w-1.5 h-1.5 rounded-full bg-star animate-pulse',
      graded: 'w-1.5 h-1.5 rounded-full bg-mint',
    };
    return map[status];
  }
}
