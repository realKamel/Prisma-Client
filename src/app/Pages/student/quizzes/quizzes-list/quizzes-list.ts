import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Quiz, QuizStats, QuizStatus } from '../../../../core/Models/quiz-model';
import { QuizzesService } from '../../../../core/Services/quizzes-service';
import { QuizCard } from '../quiz-card/quiz-card';
import { PendingModal } from '../pending-modal/pending-modal';

type FilterKey = 'all' | QuizStatus;

interface FilterChip {
  key: FilterKey;
  label: string;
}

@Component({
  selector: 'app-quizzes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, QuizCard, PendingModal],
  templateUrl: './quizzes-list.html',
})
export class QuizzesList implements OnInit {
  private quizzesService = inject(QuizzesService);

  // ── State ──────────────────────────────────────────────────────────────────
  allQuizzes: Quiz[]    = [];
  filteredQuizzes: Quiz[] = [];
  stats: QuizStats      = { total: 0, avgScore: 0, bestScore: 0, newCount: 0 };
  activeFilter: FilterKey = 'all';
  isPendingModalVisible   = false;
  isLoading               = true;

  // ── Filter chip definitions ───────────────────────────────────────────────
  filters: FilterChip[] = [
    { key: 'all',     label: 'الكل'        },
    { key: 'new',     label: 'جديد'        },
    { key: 'pending', label: 'تحت التصحيح' },
    { key: 'done',    label: 'مكتمل'       },
    { key: 'missed',  label: 'فائت'        },
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.quizzesService.getStudentQuizzes().subscribe({
      next: (quizzes) => {
        this.allQuizzes = quizzes;
        this.stats      = this.quizzesService.computeStats(quizzes);
        this.applyFilter('all');
        this.isLoading  = false;
      },
      error: () => {
        // quizzesService already falls back to static data; this rarely fires
        this.isLoading = false;
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  applyFilter(key: FilterKey): void {
    this.activeFilter   = key;
    this.filteredQuizzes = key === 'all'
      ? [...this.allQuizzes]
      : this.allQuizzes.filter(q => q.status === key);
  }

  chipCount(key: FilterKey): number {
    return key === 'all'
      ? this.allQuizzes.length
      : this.allQuizzes.filter(q => q.status === key).length;
  }

  trackById(_: number, quiz: Quiz): string {
    return quiz.id;
  }

  /** Converts a Western numeral to Eastern Arabic numeral string */
  toArabic(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }
}