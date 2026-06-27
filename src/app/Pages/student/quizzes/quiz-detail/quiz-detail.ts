import { Component, OnInit, OnDestroy, inject, signal, computed, DOCUMENT } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuizDetailService } from '../../../../core/Services/quiz-detail.service';
import { QuizQuestionComponent as QuizQuestionComponent } from '../quiz-question/quiz-question';
import {
  QuizResult,
  QuizTaking,
  SaveAnswerRequest,
  StudentAnswer,
} from '../../../../core/Models/quiz-detail.model';
import { QuestionType } from '../../../../core/enums/question-type';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmModal } from '../confirm-modal/confirm-modal';

type QuizState = 'loading' | 'taking' | 'submitting' | 'submitted' | 'graded' | 'error';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, QuizQuestionComponent, ConfirmModal],
  templateUrl: './quiz-detail.html',
})
export class QuizDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(QuizDetailService);
  private document = inject(DOCUMENT);

  // ── Signals ──────────────────────────────────────────────────
  state = signal<QuizState>('loading');
  quiz = signal<QuizTaking | null>(null);
  result = signal<QuizResult | null>(null);
  errorMessage = signal<string | null>(null);
  answers = signal<Map<number, StudentAnswer>>(new Map());

  timerDisplay = signal('٣٠:٠٠');
  timerUrgent = signal(false);
  private timerInterval?: ReturnType<typeof setInterval>;
  private remainingSeconds = 0;
  isConfirmModalVisible = signal(false);
  saveError = signal<string | null>(null);



  // ── Computed ─────────────────────────────────────────────────
  answeredCount = computed(() => this.answers().size);
  totalCount = computed(() => this.quiz()?.questions.length ?? 0);
  progressPct = computed(() =>
    this.totalCount() === 0 ? 0 : Math.round((this.answeredCount() / this.totalCount()) * 100),
  );
  allAnswered = computed(() => this.answeredCount() === this.totalCount() && this.totalCount() > 0);

  scoreClass = computed(() => {
    const pct = this.result()
      ? ((this.result()!.score ?? 0) / (this.result()!.totalDegree || 1)) * 100
      : 0;
    if (pct >= 80) return 'high';
    if (pct >= 60) return 'mid';
    return 'low';
  });

  scoreMessage = computed(() => {
    const pct = this.result()
      ? ((this.result()!.score ?? 0) / (this.result()!.totalDegree || 1)) * 100
      : 0;
    if (pct >= 80) return 'ممتاز! أداء قوي جداً';
    if (pct >= 60) return 'كويس! في مجال للتحسين';
    return 'محتاج مراجعة تاني';
  });

  posterVariant = computed(() => {
    const variants = ['pp-optics', 'pp-atom', 'pp-energy', 'pp-magnet', 'pp-thermo'];
    const id = this.quiz()?.quizId ?? 0;
    return variants[id % variants.length];
  });

  isResultLocked = computed(() => this.result()?.status === 'locked');
  isResultPending = computed(() => this.result()?.status === 'pending');



  // expose enum للـ template
  QuestionType = QuestionType;

  // ── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    const isResult = this.route.snapshot.queryParamMap.has('result');

    if (isResult) {
      this.loadResult(quizId);
    } else {
      this.loadTaking(quizId);
      this.document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  // ── Loaders ───────────────────────────────────────────────────
  private loadTaking(quizId: number): void {
    this.service.getQuizTaking(quizId).subscribe({
      next: (quiz) => {
        this.quiz.set(quiz);
        const saved = new Map<number, StudentAnswer>();
        quiz.questions.forEach((q) => {
          if (q.selectedChoiceId !== null) {
            saved.set(q.questionId, { questionId: q.questionId, choiceId: q.selectedChoiceId });
          } else if (q.savedTextAnswer !== null) {
            saved.set(q.questionId, { questionId: q.questionId, textAnswer: q.savedTextAnswer });
          }
        });
        this.answers.set(saved);
        this.state.set('taking');
        this.startTimer(quiz.remainingSeconds);
      },
      error: (err: HttpErrorResponse) => {
        this.saveError.set(err.error?.message ?? 'حدث خطأ أثناء تحميل الاختبار');
        this.state.set('error');
      },
    });
  }

  private loadResult(quizId: number): void {
    this.service.getQuizResult(quizId).subscribe({
      next: (result) => {
        this.result.set(result);
        if (result.status === 'done') {
          this.state.set('graded');
        } else {
          this.state.set('submitted');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.saveError.set(err.error?.message ?? 'حدث خطأ أثناء تحميل النتيجة');
        this.state.set('error');
      },
    });
  }

  // ── Answer handling ───────────────────────────────────────────
  onAnswered(answer: StudentAnswer): void {
    const updated = new Map(this.answers());

    if (answer.textAnswer !== undefined && answer.textAnswer.trim().length === 0) {
      updated.delete(answer.questionId);
    } else {
      updated.set(answer.questionId, answer);
    }
    this.answers.set(updated);

    // حفظ تدريجي في الـ backend
    const attemptId = this.quiz()?.attemptId;
    if (!attemptId) return;

    const body: SaveAnswerRequest = {
      questionId: answer.questionId,
      choiceId: answer.choiceId ?? null,
      textAnswer: answer.textAnswer ?? null,
    };

    // fire & forget — مش محتاجين ننتظر الـ response
    this.service.saveAnswer(attemptId, body).subscribe({
    next: () => {
    },
    error: (err: HttpErrorResponse) => {
      this.saveError.set(err.error?.message ?? 'تعذر حفظ الإجابة، حاولي تاني');
      setTimeout(() => this.saveError.set(null), 4000);
    }
  });
  }

  getAnswer(questionId: number): StudentAnswer | null {
    return this.answers().get(questionId) ?? null;
  }

  // ── Submit ────────────────────────────────────────────────────

requestSubmit(): void {
  this.isConfirmModalVisible.set(true);
}

confirmSubmit(): void {
  this.isConfirmModalVisible.set(false);

  const attemptId = this.quiz()?.attemptId;
  if (!attemptId || this.state() !== 'taking') return;

  this.state.set('submitting');

  this.service.submitQuiz(attemptId).subscribe({
    next: () => {
      this.clearTimer();
      this.state.set('submitted');
    },
    error: (err: HttpErrorResponse) => {
      this.state.set('taking');
      this.saveError.set(err.error?.message ?? 'تعذر تسليم الاختبار، حاولي تاني');
      setTimeout(() => this.saveError.set(null), 5000);
    }
  });
}

cancelSubmit(): void {
  this.isConfirmModalVisible.set(false);
}

  private autoSubmit(): void {
  if (this.state() !== 'taking') return;

  const attemptId = this.quiz()?.attemptId;
  if (!attemptId) return;

  this.state.set('submitting');


  this.service.submitQuiz(attemptId).subscribe({
    next: () => {
      this.clearTimer();
      this.state.set('submitted');
    },
    error: (err: HttpErrorResponse) => {
      this.clearTimer();
      this.saveError.set(err.error?.message ?? 'انتهى وقت الاختبار، هيتم تسليمه تلقائياً عند فتح صفحة الاختبارات'
      );
      this.state.set('error');
    }
  });
  }

  checkResult(): void {
    const quizId = this.quiz()?.quizId;
    if (!quizId) return;
    this.loadResult(quizId);
  }

  // ── Timer ─────────────────────────────────────────────────────
  private startTimer(seconds: number): void {
    this.remainingSeconds = seconds;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.updateTimerDisplay();
        this.clearTimer();
        this.autoSubmit();
        return;
      }
      if (this.remainingSeconds <= 300) this.timerUrgent.set(true);
      this.updateTimerDisplay();
    }, 1000);
  }

  private updateTimerDisplay(): void {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    this.timerDisplay.set(
      `${this.toArabic(m).padStart(2, '٠')}:${this.toArabic(s).padStart(2, '٠')}`,
    );
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  toArabic(n: number): string {
    return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  posterGradient(variant: string): string {
    const map: Record<string, string> = {
      'pp-energy': 'linear-gradient(135deg,#1a3a4a,#2a6060)',
      'pp-magnet': 'linear-gradient(135deg,#2d1b4e,#4a3080)',
      'pp-wave': 'linear-gradient(135deg,#1a4030,#2d6b50)',
      'pp-atom': 'linear-gradient(135deg,#1a2a4a,#2d4a7a)',
      'pp-thermo': 'linear-gradient(135deg,#3a1a1a,#7a2d2d)',
      'pp-optics': 'linear-gradient(135deg,#1a3a3a,#2d6b6b)',
    };
    return map[variant] ?? map['pp-energy'];
  }

  navigateBack(): void {
    this.router.navigate(['/quizzes']);
  }

  private onVisibilityChange = (): void => {
    if (this.document.hidden && this.state() === 'taking') {
      const attemptId = this.quiz()?.attemptId;
      if (attemptId) {
        this.service.reportSecurityEvent(attemptId, 'TabSwitch').subscribe();
      }
    }
  };

  onSecurityViolation(eventType: 'CopyPasteAttempt'): void {
    const attemptId = this.quiz()?.attemptId;
    if (attemptId) {
      this.service.reportSecurityEvent(attemptId, eventType).subscribe();
    }
  }

  formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ar-EG', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });
}
}
