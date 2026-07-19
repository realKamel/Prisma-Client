import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QuizCard } from '../quiz-card/quiz-card';
import { PendingModal } from '../pending-modal/pending-modal';
import { QuizListItem, QuizStats, QuizStatus } from '../../../../core/Models/quiz-model';
import { QuizzesService } from '../../../../core/Services/quizzes-service';
import { HttpErrorResponse } from '@angular/common/http';

type FilterKey = 'all' | QuizStatus;

interface FilterChip {
  key: FilterKey;
  label: string;
}

@Component({
  selector: 'app-quizzes-list',
  imports: [RouterModule, QuizCard, PendingModal],
  templateUrl: './quizzes-list.html',
})
export class QuizzesList implements OnInit {
  private quizzesService = inject(QuizzesService);

  // ── Signals ────────────────────────────────────────────────────
  allQuizzes = signal<QuizListItem[]>([]);
  stats = signal<QuizStats>({
    total: 0,
    averageScorePercent: 0,
    bestScorePercent: 0,
    newCount: 0,
    pendingCount: 0,
    doneCount: 0,
    missedCount: 0,
    upcomingCount: 0,
  });
  activeFilter = signal<FilterKey>('all');
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  isPendingModalVisible = signal(false);

  // ── Computed ───────────────────────────────────────────────────
  filteredQuizzes = computed(() => {
    const filter = this.activeFilter();
    const all = this.allQuizzes();
    return filter === 'all' ? all : all.filter((q) => q.status === filter);
  });

  filters: FilterChip[] = [
    { key: 'all', label: 'الكل' },
    { key: 'new', label: 'جديد' },
    { key: 'pending', label: 'تحت التصحيح' },
    { key: 'done', label: 'مكتمل' },
    { key: 'missed', label: 'فائت' },
    { key: 'upcoming', label: 'قادم' },
  ];

  ngOnInit(): void {
    console.log('ngOnInit fired');
    this.loadQuizzes();
  }

  loadQuizzes(): void {
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
  applyFilter(key: FilterKey): void {
    this.activeFilter.set(key);
  }

  chipCount(key: FilterKey): number {
    const s = this.stats();
    const map: Record<FilterKey, number> = {
      all: s.total,
      new: s.newCount,
      pending: s.pendingCount,
      done: s.doneCount,
      missed: s.missedCount,
      upcoming: s.upcomingCount,
    };
    return map[key];
  }

  trackById(_: number, quiz: QuizListItem): number {
    return quiz.quizId;
  }

  toArabic(n: number): string {
    return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }
}
