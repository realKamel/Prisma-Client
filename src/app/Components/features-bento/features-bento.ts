import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface QuizOption {
  id: string;
  label: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correct: string;
}

@Component({
  selector: 'app-features-bento',
  standalone: true,
  imports: [CommonModule],

  templateUrl: './features-bento.html'
})
export class FeaturesBento implements OnInit {

  quizData: QuizQuestion[] = [];
    private cdr = inject(ChangeDetectorRef);


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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<QuizQuestion[]>('data/quiz.json').subscribe({
      next: (data) => {this.quizData = data ; this.cdr.detectChanges()},
      error: (err) => console.error('Failed to load quiz data:', err)
    });
  }

  get currentQuestion(): QuizQuestion {
    return this.quizData[this.currentQuestionIndex];
  }

  selectOption(optionId: string): void {
    if (this.answered) return;
    this.selectedQuizOption = optionId;
    this.answered = true;
  }

  nextQuestion(): void {
    this.currentQuestionIndex = (this.currentQuestionIndex + 1) % this.quizData.length;
    this.selectedQuizOption = null;
    this.answered = false;
  }

  isCorrect(optionId: string): boolean {
    return this.answered && optionId === this.currentQuestion.correct;
  }

  isWrong(optionId: string): boolean {
    return this.answered && optionId === this.selectedQuizOption && optionId !== this.currentQuestion.correct;
  }
}