import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/Services/config'; 
import { QuizQuestion } from '../../core/Models/platform-config';

@Component({
  selector: 'app-features-bento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-bento.html',
})
export class FeaturesBento {
  private configService = inject(ConfigService);

  quizData = computed<QuizQuestion[]>(() => {
    return this.configService.config()?.quiz ?? [];
  });

  currentQuestionIndex: number = 0;
  selectedQuizOption: string | null = null;
  answered: boolean = false;

  streakDays = [
    { label: 'س', current: false, missed: false },
    { label: 'إ', current: false, missed: false },
    { label: 'ث', current: false, missed: false },
    { label: 'ر', current: false, missed: false },
    { label: 'خ', current: true,  missed: false },
    { label: 'ج', current: false, missed: true  },
    { label: 'س', current: false, missed: true  },
  ];

  // 2. Updated getter to read from the quizData signal safely
  get currentQuestion(): QuizQuestion | undefined {
    return this.quizData()[this.currentQuestionIndex];
  }

  selectOption(optionId: string): void {
    if (this.answered || !this.currentQuestion) return;
    this.selectedQuizOption = optionId;
    this.answered = true;
  }

  nextQuestion(): void {
    const totalQuestions = this.quizData().length;
    if (totalQuestions === 0) return;

    this.currentQuestionIndex = (this.currentQuestionIndex + 1) % totalQuestions;
    this.selectedQuizOption = null;
    this.answered = false;
  }

  isCorrect(optionId: string): boolean {
    return this.answered && optionId === this.currentQuestion?.correct;
  }

  isWrong(optionId: string): boolean {
    return this.answered && 
           optionId === this.selectedQuizOption && 
           optionId !== this.currentQuestion?.correct;
  }
}