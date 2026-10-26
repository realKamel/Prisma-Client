import {
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizQuestionComponent } from '../quiz-question/quiz-question';

import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  catchError,
  EMPTY,
  filter,
  groupBy,
  map,
  mergeMap,
  Observable,
  of,
  race,
  retry,
  Subject,
  switchMap,
  take,
  tap,
  timeout,
  timer,
} from 'rxjs';
import { QuestionType } from '../../../../../core/enums/question-type';
import {
  QuizResult,
  QuizTaking,
  SaveAnswerRequest,
  StudentAnswer,
} from '../../../../../core/models/quiz-detail.model';
import { QuizDetailService } from '../../../../../core/services/quiz-detail.service';
import { IProblemDetails } from '../../../../../shared/models/problem-details';
import { backoffDelay, isRetryableStatus } from '../../../../../utils/retry-backoff';
import { ConfirmModal } from '../confirm-modal/confirm-modal';

type QuizState = 'loading' | 'taking' | 'submitting' | 'submitted' | 'graded' | 'error';
type SaveStatus = 'pending' | 'saving' | 'saved' | 'failed';

interface QueuedAnswer {
  attemptId: number;
  answer: StudentAnswer;
  seq: number;
}

const TEXT_DEBOUNCE_MS = 800;
const MAX_SAVE_RETRIES = 6; // ~30s of backoff in total
const LEAVE_WAIT_MS = 10_000;

@Component({
  selector: 'app-quiz-detail',
  imports: [
    RouterModule,
    QuizQuestionComponent,
    ConfirmModal,
    DecimalPipe,
    DatePipe,
    NgmMotionDirective,
  ],
  templateUrl: './quiz-detail.html',
  providers: [DecimalPipe, DatePipe],
})
export class QuizDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(QuizDetailService);
  private readonly numberPipe = inject(DecimalPipe);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private answer$ = new Subject<QueuedAnswer>();
  private lastSeq = 0;
  // Emits to skip the typing debounce and send pending text saves right now
  private flush$ = new Subject<void>();

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
  saveStatus = signal<Map<number, SaveStatus>>(new Map());
  unsavedCount = computed(
    () => [...this.saveStatus().values()].filter((s) => s !== 'saved').length,
  );
  statusOf = (questionId: number): SaveStatus => this.saveStatus().get(questionId) ?? 'saved';
  private inFlightCount = computed(
    () => [...this.saveStatus().values()].filter((s) => s === 'pending' || s === 'saving').length,
  );

  flushPending(): void {
    this.flush$.next();
  }
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
      this.initSaveQueue();
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
        this.saveError.set(
          (err.error as IProblemDetails | undefined)?.detail ??
            (err.error as IProblemDetails | undefined)?.title ??
            'حدث خطأ أثناء تحميل الاختبار',
        );
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
        this.saveError.set(
          (err.error as IProblemDetails | undefined)?.detail ??
            (err.error as IProblemDetails | undefined)?.title ??
            'حدث خطأ أثناء تحميل النتيجة',
        );
        this.state.set('error');
      },
    });
  }

  // Time-based, so it keeps increasing even after a page reload
  private nextSeq(): number {
    this.lastSeq = Math.max(Date.now(), this.lastSeq + 1);
    return this.lastSeq;
  }

  private setStatus(questionId: number, status: SaveStatus): void {
    this.saveStatus.update((m) => new Map(m).set(questionId, status));
  }

  private initSaveQueue(): void {
    this.answer$
      .pipe(
        groupBy(({ answer }) => answer.questionId),
        mergeMap((group$) =>
          group$.pipe(
            // Latest answer per question wins: a pending/retrying older save is cancelled
            switchMap(({ attemptId, answer, seq }) =>
              // Wait for the debounce, or until a flush arrives (blur / leaving the page), whichever is first
              race(
                timer(answer.textAnswer !== undefined ? TEXT_DEBOUNCE_MS : 0),
                this.flush$.pipe(take(1)),
              ).pipe(
                tap(() => this.setStatus(answer.questionId, 'saving')),
                switchMap(() =>
                  this.service.saveAnswer(attemptId, {
                    questionId: answer.questionId,
                    choiceId: answer.choiceId ?? null,
                    textAnswer: answer.textAnswer ?? null,
                    clientSeq: seq,
                  }),
                ),
                retry({ count: MAX_SAVE_RETRIES, delay: backoffDelay }),
                tap(() => this.setStatus(answer.questionId, 'saved')),
                catchError((err: unknown) => {
                  this.onSaveFailed(answer.questionId, err);
                  return EMPTY;
                }),
              ),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private onSaveFailed(questionId: number, err: unknown): void {
    this.setStatus(questionId, 'failed');

    // Non-retryable errors (e.g. time is over) carry a message the student should see
    if (err instanceof HttpErrorResponse && !isRetryableStatus(err.status)) {
      const problem = err.error as IProblemDetails | undefined;
      this.saveError.set(problem?.detail ?? problem?.title ?? 'تعذر حفظ الإجابة');
      setTimeout(() => this.saveError.set(null), 5000);
    }
  }

  retrySave(questionId: number): void {
    const current = this.answers().get(questionId);
    // A cleared essay was removed from the map, so re-send an empty text
    this.onAnswered(current ?? { questionId, textAnswer: '' });
  }

  // ── Answer handling ───────────────────────────────────────────
  onAnswered(answer: StudentAnswer): void {
    // Once submission starts, the submit payload is the source of truth
    if (this.state() !== 'taking') return;

    const updated = new Map(this.answers());
    if (answer.textAnswer !== undefined && answer.textAnswer.trim().length === 0) {
      updated.delete(answer.questionId);
    } else {
      updated.set(answer.questionId, answer);
    }
    this.answers.set(updated);

    const attemptId = this.quiz()?.attemptId;
    if (!attemptId) return;

    this.setStatus(answer.questionId, 'pending');
    this.answer$.next({ attemptId, answer, seq: this.nextSeq() });
  }
  getAnswer(questionId: number): StudentAnswer | null {
    return this.answers().get(questionId) ?? null;
  }

  // ── Submit ────────────────────────────────────────────────────
  /**
   * Builds the full answer list from the client state, which is the source of truth.
   * It covers EVERY question, so an answer the student cleared is sent as null
   * and the server does not keep the old text.
   */
  private buildSubmitPayload(): SaveAnswerRequest[] {
    const seq = this.nextSeq();
    return (this.quiz()?.questions ?? []).map((q) => {
      const a = this.answers().get(q.questionId);
      return {
        questionId: q.questionId,
        choiceId: a?.choiceId ?? null,
        textAnswer: a?.textAnswer ?? null,
        clientSeq: seq,
      };
    });
  }

  requestSubmit(): void {
    this.isConfirmModalVisible.set(true);
  }

  confirmSubmit(): void {
    this.isConfirmModalVisible.set(false);

    const attemptId = this.quiz()?.attemptId;
    if (!attemptId || this.state() !== 'taking') return;

    this.state.set('submitting');

    this.service
      .submitQuiz(attemptId, this.buildSubmitPayload())
      .pipe(retry({ count: 3, delay: backoffDelay }))
      .subscribe({
        next: (res) => {
          this.clearTimer();
          this.state.set('submitted');
          if (res.wasLate) this.showLateNotice();
        },
        error: (err: HttpErrorResponse) => {
          // Back to 'taking' so the student can try again; answers are still in the UI
          this.state.set('taking');
          this.saveError.set(
            (err.error as IProblemDetails | undefined)?.detail ??
              (err.error as IProblemDetails | undefined)?.title ??
              'تعذر تسليم الاختبار، حاولي تاني',
          );
          setTimeout(() => this.saveError.set(null), 5000);
        },
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

    this.service
      .submitQuiz(attemptId, this.buildSubmitPayload())
      .pipe(retry({ count: 5, delay: backoffDelay })) // time is over: try harder than a manual submit
      .subscribe({
        next: (res) => {
          this.clearTimer();
          this.state.set('submitted');
          if (res.wasLate) this.showLateNotice();
        },
        error: (err: HttpErrorResponse) => {
          this.clearTimer();
          this.saveError.set(
            (err.error as IProblemDetails | undefined)?.detail ??
              (err.error as IProblemDetails | undefined)?.title ??
              'انتهى وقت الاختبار، هيتم تسليمه تلقائياً عند فتح صفحة الاختبارات',
          );
          this.state.set('error');
        },
      });
  }

  checkResult(): void {
    const quizId = this.quiz()?.quizId;
    if (!quizId) return;
    this.loadResult(quizId);
  }

  private showLateNotice(): void {
    this.saveError.set('تم تسليم الاختبار بعد انتهاء الوقت، وتم تصحيح الإجابات المحفوظة فقط');
    setTimeout(() => this.saveError.set(null), 6000);
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
      `${this.numberPipe.transform(m)?.toString().padStart(2, '٠')}:${this.numberPipe.transform(s)?.toString().padStart(2, '٠')}`,
    );
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
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

  async navigateBack(): Promise<void> {
    await this.router.navigate(['/quizzes']);
  }

  private onVisibilityChange = (): void => {
    if (this.document.hidden && this.state() === 'taking') {
      this.flushPending();
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

  /** Used by the route's canDeactivate: waits for pending saves before the student leaves. */
  canLeave(): Observable<boolean> | boolean {
    if (this.state() !== 'taking' || this.unsavedCount() === 0) return true;

    this.flushPending();

    return timer(0, 150).pipe(
      filter(() => this.inFlightCount() === 0), // nothing pending or in flight anymore
      take(1),
      timeout({ first: LEAVE_WAIT_MS, with: () => of(0) }),
      // Whatever is still unsaved here has failed (or timed out): let the student decide
      map(
        () =>
          this.unsavedCount() === 0 ||
          confirm('بعض إجاباتك لم تُحفظ بعد. لو خرجتي دلوقتي ممكن تضيع. هل تريدين الخروج؟'),
      ),
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.state() !== 'taking') return;
    this.flushPending();
    if (this.unsavedCount() > 0) event.preventDefault();
  }

  // Mobile Safari does not reliably fire beforeunload; pagehide is the dependable signal there
  @HostListener('window:pagehide')
  onPageHide(): void {
    if (this.state() === 'taking') this.flushPending();
  }

  @HostListener('focusout')
  onFocusOut(): void {
    this.flushPending();
  }
}
