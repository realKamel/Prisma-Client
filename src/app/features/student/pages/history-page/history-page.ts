import { PercentPipe } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowRepeat,
  bootstrapBook,
  bootstrapChevronRight,
  bootstrapClock,
  bootstrapClockHistory,
  bootstrapExclamationTriangle,
  bootstrapFunnel,
  bootstrapJournalText,
  bootstrapPencil,
} from '@ng-icons/bootstrap-icons';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { History, LessonStatus, Status } from '../../models/history.models';
import { StudentService } from '../../services/student.service';
import { HistoryCardComponent } from './components/card-history/card-history';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator';
import { TOUR_KEYS, TourStep } from '../../../../core/models/tour.model';
import { TourService } from '../../../../core/services/tours/tour.service';
import { autoStartTour } from '../../../../core/services/tours/auto-start-tour';

const ZERO_STATS: Status = {
  totalPurchasedLessons: 0,
  completedLessonsCount: 0,
  totalStudyCount: 0,
  averageQuizDegree: 0,
};

@Component({
  selector: 'app-history-page',
  imports: [
    HistoryCardComponent,
    NgmMotionDirective,
    PercentPipe,
    RouterLink,
    NgIcon,
    TranslatePipe,
    PaginatorComponent,
  ],
  viewProviders: [
    provideIcons({
      bootstrapArrowRepeat,
      bootstrapBook,
      bootstrapChevronRight,
      bootstrapClock,
      bootstrapExclamationTriangle,
      bootstrapJournalText,
      bootstrapPencil,
    }),
  ],
  templateUrl: './history-page.html',
})
export class HistoryPageComponent {
  private readonly _studentService = inject(StudentService);
  private readonly tours = inject(TourService);
  private readonly translate = inject(TranslateService);

  protected readonly stats = this._studentService.systemStats;
  protected readonly filteredList = this._studentService.filteredHistory;
  protected readonly currentFilter = this._studentService.activeFilter;
  protected readonly metricsCounts = this._studentService.filterCounts;
  protected readonly isLoading = this._studentService.isLoading;
  protected readonly isFailed = computed(() => !!this._studentService.error());

  protected readonly pageNumber = this._studentService.pageNumber;
  protected readonly totalPages = this._studentService.totalPages;
  protected readonly pageSize = this._studentService.pageSize;
  protected readonly totalCount = this._studentService.totalCount;

  protected readonly filters: { value: 'All' | 'Active' | 'Done' | 'Expired'; label: string }[] = [
    { value: 'All', label: 'STUDENT.HISTORY.STATUS.ALL' },
    { value: 'Active', label: 'STUDENT.HISTORY.STATUS.ACTIVE' },
    { value: 'Done', label: 'STUDENT.HISTORY.STATUS.DONE' },
    { value: 'Expired', label: 'STUDENT.HISTORY.STATUS.EXPIRED' },
  ];

  protected readonly animatedStats = signal<Status>(ZERO_STATS);

  private rafId = 0;

  protected readonly completionPct = computed(() => {
    const s = this.animatedStats();
    return s.totalPurchasedLessons
      ? Math.round((s.completedLessonsCount / s.totalPurchasedLessons) * 100)
      : 0;
  });

  protected readonly ringBackground = computed(
    () =>
      `conic-gradient(var(--color-primary) ${this.completionPct()}%, var(--color-surface-subtle) 0)`,
  );

  protected readonly statTiles = computed(() => {
    const s = this.animatedStats();
    return [
      { label: 'STUDENT.HISTORY.STATS.PURCHASED', value: s.totalPurchasedLessons, icon: 'bootstrapBook', tone: 'bg-primary/12 text-primary-light', percent: false },
      { label: 'STUDENT.HISTORY.STATS.HOURS', value: s.totalStudyCount, icon: 'bootstrapClock', tone: 'bg-star/12 text-star', percent: false },
      { label: 'STUDENT.HISTORY.STATS.QUIZ_AVG', value: s.averageQuizDegree, icon: 'bootstrapPencil', tone: 'bg-coral/10 text-coral', percent: true },
    ];
  });

  /** Tour-only placeholder, shown when the student has no history yet. */
  protected readonly showDemoCard = computed(
    () =>
      !this.isLoading() &&
      !this.isFailed() &&
      this.currentFilter() === 'All' &&
      this.filteredList().length === 0 &&
      this.tours.isReady() &&
      !this.tours.seenTours().has(TOUR_KEYS.student.history),
  );

  protected readonly demoLesson = computed<History>(() => ({
    lessonId: 'demo',
    imageUrl: '',
    title: this.translate.instant('STUDENT.HISTORY.DEMO.TITLE'),
    subject: this.translate.instant('STUDENT.HISTORY.DEMO.SUBJECT'),
    teacherName: this.translate.instant('STUDENT.HISTORY.DEMO.TEACHER'),
    status: 'Active',
    purchaseDate: new Date(),
    finishAt: new Date(),
    quizDegree: 0,
    quizScore: 0,
    lessonPercentage: 40,
  }));

  constructor() {
    this._studentService.loadHistory();
    this._studentService.loadPerformance();

    effect(() => {
      const stats = this._studentService.systemStats();
      if (stats) this.runCountersAnimation(stats);
    });

    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.rafId));

    autoStartTour({
      key: TOUR_KEYS.student.history,
      ready: () =>
        !this.isLoading() &&
        !this.isFailed() &&
        (this.filteredList().length > 0 || this.showDemoCard()),
      steps: (): TourStep[] => [
        {
          element: '[data-tour-step="history-filters"]',
          titleKey: 'TOUR.STUDENT.HISTORY.FILTERS.TITLE',
          descriptionKey: 'TOUR.STUDENT.HISTORY.FILTERS.DESCRIPTION',
          icon: bootstrapFunnel,
          motion: 'float',
          side: 'bottom',
          align: 'start',
        },
        {
          element: '[data-tour-step="history-card"]',
          titleKey: 'TOUR.STUDENT.HISTORY.CARD.TITLE',
          descriptionKey: 'TOUR.STUDENT.HISTORY.CARD.DESCRIPTION',
          icon: bootstrapClockHistory,
          motion: 'pulse',
          side: 'top',
          align: 'center',
        },
      ],
    });
  }

  protected changeFilter(target: LessonStatus): void {
    this._studentService.updateFilter(target);
  }

  protected retry(): void {
    this._studentService.loadHistory();
    this._studentService.loadPerformance();
  }

  protected goToPage(page: number): void {
    this._studentService.goToPage(page);
  }

  private runCountersAnimation(target: Status): void {
    cancelAnimationFrame(this.rafId);
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.animatedStats.set({
        totalPurchasedLessons: Math.round(ease * target.totalPurchasedLessons),
        completedLessonsCount: Math.round(ease * target.completedLessonsCount),
        totalStudyCount: Math.round(ease * target.totalStudyCount),
        // not rounded: it's a fraction, rounding would snap it to 0 or 1
        averageQuizDegree: ease * target.averageQuizDegree,
      });

      if (progress < 1) this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }
}