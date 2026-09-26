import { PercentPipe } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { History, LessonStatus, Status } from '../../models/history.models';
import { StudentService } from '../../services/student.service';
import { HistoryCardComponent } from './components/card-history/card-history';

@Component({
  selector: 'app-history-page',
  imports: [HistoryCardComponent, NgmMotionDirective, PercentPipe],
  templateUrl: './history-page.html',
})
export class HistoryPageComponent implements OnInit {
  private readonly _studentService = inject(StudentService);

  // Exposing signals safely to template ecosystem
  protected readonly stats = this._studentService.systemStats;
  protected readonly filteredList = this._studentService.filteredHistory;
  protected readonly currentFilter = this._studentService.activeFilter;
  protected readonly metricsCounts = this._studentService.filterCounts;
  protected readonly isLoading = this._studentService.isLoading;

  // Pagination selectors (same pattern as the teacher list)
  protected readonly pageNumber = this._studentService.pageNumber;
  protected readonly totalPages = this._studentService.totalPages;
  protected readonly hasNextPage = this._studentService.hasNextPage;
  protected readonly hasPrevPage = this._studentService.hasPrevPage;

  private readonly targetStats = signal<Status>({
    totalPurchasedLessons: 0,
    completedLessonsCount: 0,
    totalStudyCount: 0,
    averageQuizDegree: 0,
  });

  protected readonly animatedStats = signal<Status>({
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

  public ngOnInit() {
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

  protected changeFilter(targetFilter: LessonStatus): void {
    this._studentService.updateFilter(targetFilter);
  }

  protected nextPage(): void {
    this._studentService.nextPage();
  }

  protected prevPage(): void {
    this._studentService.prevPage();
  }

  /**
   * TrackBy function optimized for performance
   */
  protected trackByLessonId(index: number, item: History): string {
    return item.lessonId;
  }
}
