import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { History, LessonStatus, Status } from '../../models/history.models';
import { StudentService } from '../../services/student.service';
import { HistoryCardComponent } from './components/card-history/card-history';

@Component({
  selector: 'app-history-page',
  imports: [HistoryCardComponent],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage implements OnInit {
  private readonly _studentService = inject(StudentService);

  // Exposing signals safely to template ecosystem
  readonly stats = this._studentService.systemStats;
  readonly filteredList = this._studentService.filteredHistory;
  readonly currentFilter = this._studentService.activeFilter;
  readonly metricsCounts = this._studentService.filterCounts;
  readonly isLoading = this._studentService.isLoading;

  // Pagination selectors (same pattern as the teacher list)
  readonly pageNumber = this._studentService.pageNumber;
  readonly totalPages = this._studentService.totalPages;
  readonly hasNextPage = this._studentService.hasNextPage;
  readonly hasPrevPage = this._studentService.hasPrevPage;

  private targetStats = signal<Status>({
    totalPurchasedLessons: 0,
    completedLessonsCount: 0,
    totalStudyCount: 0,
    averageQuizDegree: 0,
  });

  protected animatedStats = signal<Status>({
    totalPurchasedLessons: 0,
    completedLessonsCount: 0,
    totalStudyCount: 0,
    averageQuizDegree: 0,
  });

  constructor() {
    // Re-run the counter animation whenever fresh stats arrive from the store.
    effect(() => {
      const stats = this._studentService.systemStats();
      if (!stats) return;
      this.targetStats.set(stats);
      this.runCountersAnimation();
    });
  }

  ngOnInit() {
    this._studentService.loadHistory();
    this._studentService.loadPerformance();
  }

  private runCountersAnimation() {
    const duration = 1200;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease = 1 - Math.pow(1 - progress, 3);

      this.animatedStats.set({
        totalPurchasedLessons: Math.round(ease * this.targetStats().totalPurchasedLessons),
        completedLessonsCount: Math.round(ease * this.targetStats().completedLessonsCount),
        totalStudyCount: Math.round(ease * this.targetStats().totalStudyCount),
        averageQuizDegree: Math.round(ease * this.targetStats().averageQuizDegree),
      });

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  changeFilter(targetFilter: LessonStatus): void {
    this._studentService.updateFilter(targetFilter);
  }

  nextPage(): void {
    this._studentService.nextPage();
  }

  prevPage(): void {
    this._studentService.prevPage();
  }

  /**
   * TrackBy function optimized for performance
   */
  trackByLessonId(index: number, item: History): string {
    return item.lessonId;
  }
}
