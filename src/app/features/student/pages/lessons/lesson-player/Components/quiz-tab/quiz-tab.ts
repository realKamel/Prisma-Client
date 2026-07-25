import { Component, inject, Input, OnInit, input, signal } from '@angular/core';

import { Quiz } from '../../../../../../../core/Models/Lesson/Lesson-Player';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapEye,
  bootstrapJournalCheck,
  bootstrapLightningFill,
  bootstrapTrophyFill,
} from '@ng-icons/bootstrap-icons';

export interface QuizDetails {
  id: string;
  questionsCount: number;
  durationMinutes: number;
  passingScore: number;
}

@Component({
  selector: 'app-quiz-tab',
  imports: [RouterLink, NgIcon],
  templateUrl: './quiz-tab.html',
  viewProviders: [
    provideIcons({
      bootstrapJournalCheck,
      bootstrapLightningFill,
      bootstrapTrophyFill,
      bootstrapEye,
    }),
  ],
})
export class QuizTab implements OnInit {
  readonly lessonId = input<string | number>();
  // @Input() quiz!: Quiz | null;
  readonly quiz = input<Quiz>();
  private router = inject(Router);

  protected readonly isQuizCompleted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly btnText = signal('ابدأ الاختبار التقييمي الآن');

  ngOnInit(): void {
    if (this.quiz()?.isAttempted) {
      this.isQuizCompleted.set(true);
    }
  }

  startQuiz(): void {
    this.isLoading.set(true);
    this.btnText.set('جاري التحميل...');
    this.router.navigate(['/quizzes', this.quiz()?.id]);
  }
}
