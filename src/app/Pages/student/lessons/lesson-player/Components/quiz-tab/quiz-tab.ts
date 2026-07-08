import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz } from '../../../../../../core/Models/Lesson/Lesson-Player';
import { Router, RouterLink } from '@angular/router';

export interface QuizDetails {
  id: string;
  questionsCount: number;
  durationMinutes: number;
  passingScore: number;
}

@Component({
  selector: 'app-quiz-tab',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz-tab.html'
})
export class QuizTab implements OnInit {
  @Input() lessonId!: string | number;
  @Input() quiz!: Quiz | null;
  private router = inject(Router);

  isQuizCompleted: boolean = false;
  isLoading: boolean = false;
  btnText: string = 'ابدأ الاختبار التقييمي الآن';

  ngOnInit(): void {
    if (this.quiz?.isAttempted) {
      this.isQuizCompleted = true;
    }
  }

  startQuiz(): void {
    this.isLoading = true;
    this.btnText = 'جاري التحميل...';
    this.router.navigate(['/quizzes', this.quiz?.id]);
  }
}