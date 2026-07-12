import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { History, LessonStatus, Status } from '../models/history.models';
import { toast } from 'ngx-sonner';
import { ArNumberPipe } from '../../../core/pipes/arabic-numbers/ar-number-pipe';
import { StudentService } from '../services/student.service';
import { HistoryCardComponent } from './components/card-history/card-history';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history-page',
  imports: [HistoryCardComponent],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage implements OnInit {
  // private allLessons = signal<History[]>([]);
  private readonly _studentService = inject(StudentService);

  // Exposing signals safely to template ecosystem
  readonly stats = this._studentService.systemStats;
  readonly filteredList = this._studentService.filteredHistory;
  readonly currentFilter = this._studentService.activeFilter;
  readonly metricsCounts = this._studentService.filterCounts;

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

  ngOnInit() {
    this.runCountersAnimation();
    this._studentService.GetStudentHistory().subscribe({
      next: (response) => {
        toast.success('Loaded Data');
        this.targetStats.set(response.data.status);
      },
      error: (error) => {
        console.error(error);
        this._studentService.loadHistoryState({
          status: {
            totalPurchasedLessons: 7,
            completedLessonsCount: 5,
            totalStudyCount: 32,
            averageQuizDegree: 84,
          },
          history: [
            {
              lessonId: 1,
              imageUrl: '⚡',
              title: 'الكهرباء الساكنة',
              status: 'Done',
              purchaseDate: new Date('2026-04-20'),
              finishAt: new Date('2026-05-02'),
              quizDegree: 92,
              lessonPercentage: 100,
            },
            {
              lessonId: 2,
              imageUrl: '⚙️',
              title: 'القوة والحركة — معادلات الحركة',
              status: 'Active',
              purchaseDate: new Date('2026-04-26'),
              finishAt: new Date(),
              quizDegree: 0,
              lessonPercentage: 65,
            },
            {
              lessonId: 6,
              imageUrl: '◐',
              title: 'الحركة المتسارعة والتسارع الثابت',
              status: 'Expired',
              purchaseDate: new Date('2026-03-01'),
              finishAt: new Date('2026-04-01'),
              expiresAt: new Date('2026-04-01'),
              quizDegree: 0,
              lessonPercentage: 40,
            },
          ],
        });
      },
    });
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

  /**
   * TrackBy function optimized for performance
   */
  trackByLessonId(index: number, item: any): number {
    return item.lessonId;
  }
}
