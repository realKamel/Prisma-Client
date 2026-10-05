import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  cardEntranceTransition,
  pageEntranceAnimate,
  pageEntranceInitial,
  pageEntranceTransition,
  stateSwapTransition,
} from '../../../../../core/animations/motion.animations';
import { QuizListItem, QuizStats, QuizStatus } from '../../../../../core/Models/quiz-model';
import { QuizzesService } from '../../../../../core/Services/quizzes-service';
import { CountUpDirective } from '../../../../../shared/directives/count-up/count-up.directive';
import { PendingModal } from '../pending-modal/pending-modal';
import { QuizCard } from '../quiz-card/quiz-card';

type FilterKey = 'all' | QuizStatus;

interface FilterChip {
  key: FilterKey;
  label: string;
}

@Component({
  selector: 'app-quizzes-list',
  imports: [
    RouterModule,
    QuizCard,
    PendingModal,
    CountUpDirective,
    DecimalPipe,
    NgmMotionDirective,
  ],
  templateUrl: './quizzes-list.html',
})
export class QuizzesListPageComponent implements OnInit {
  private quizzesService = inject(QuizzesService);

  protected readonly pageInitial = pageEntranceInitial;
  protected readonly pageAnimate = pageEntranceAnimate;
  protected readonly sectionTransition = pageEntranceTransition;
  protected readonly cardTransition = cardEntranceTransition;
  protected readonly quickTransition = stateSwapTransition;

  // ── Signals ────────────────────────────────────────────────────
  protected readonly allQuizzes = signal<QuizListItem[]>([]);
  protected readonly stats = signal<QuizStats>({
    total: 0,
    averageScorePercent: 0,
    bestScorePercent: 0,
    newCount: 0,
    pendingCount: 0,
    doneCount: 0,
    missedCount: 0,
    upcomingCount: 0,
    inProgressCount: 0,
  });
  protected readonly activeFilter = signal<FilterKey>('all');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isPendingModalVisible = signal(false);

  // ── Computed ───────────────────────────────────────────────────
  protected readonly filteredQuizzes = computed(() => {
    const filter = this.activeFilter();
    const all = this.allQuizzes();
    return filter === 'all' ? all : all.filter((q) => q.status === filter);
  });

  protected readonly filters: FilterChip[] = [
    { key: 'all', label: 'الكل' },
    { key: 'new', label: 'جديد' },
    { key: 'pending', label: 'تحت التصحيح' },
    { key: 'done', label: 'مكتمل' },
    { key: 'missed', label: 'فائت' },
    { key: 'upcoming', label: 'قادم' },
    { key: 'in_progress', label: 'قيد التنفيذ' },
  ];

  public ngOnInit(): void {
    console.log('ngOnInit fired');
    this.loadQuizzes();
  }

  protected loadQuizzes(): void {
    console.log('loadQuizzes fired');
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.quizzesService.getStudentQuizzes().subscribe({
      next: (res) => {
        console.log('next fired', res);

        this.allQuizzes.set(res.items);
        this.stats.set(res.stats);
        // this.applyFilter('all');

        this.isLoading.set(false);
        console.log('isLoading:', this.isLoading, 'filteredQuizzes:', this.filteredQuizzes.length);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(
          err.status === 0
            ? 'تعذر الاتصال بالسيرفر، تحقق من الإنترنت'
            : 'حدث خطأ أثناء تحميل الاختبارات، حاول مرة أخرى',
        );
        console.log('error fired', err);
        this.isLoading.set(false);
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────
  protected applyFilter(key: FilterKey): void {
    this.activeFilter.set(key);
  }

  protected chipCount(key: FilterKey): number {
    const s = this.stats();
    const map: Record<FilterKey, number> = {
      all: s.total,
      new: s.newCount,
      pending: s.pendingCount,
      done: s.doneCount,
      missed: s.missedCount,
      upcoming: s.upcomingCount,
      in_progress: s.inProgressCount,
    };
    return map[key];
  }

  protected trackById(_: number, quiz: QuizListItem): number {
    return quiz.quizId;
  }
}
