import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  GradingAttemptDetail,
  GradingListItem,
  GradingStatus,
} from '../../../../core/Models/Teacher/teacher-exams-model';
import {
  studentInitials,
} from '../../../../core/pipes/arabic-numerals/arabic-numerals';
import { QuestionType } from '../../../../core/enums/question-type';
import { DatePipe, DecimalPipe } from '@angular/common';

// Bundled context passed in from the parent so we only need one input
export interface GradingContext {
  item: GradingListItem;
  attempt: GradingAttemptDetail;
}

export interface GradeSubmitEvent {
  attemptId: number;
  grades: { answerId: number; score: number }[];
}

export interface OverrideSubmitEvent {
  attemptId: number;
  penaltyScore: number;
}

@Component({
  selector: 'app-exam-grading',
  imports: [FormsModule, DatePipe,DecimalPipe],
  templateUrl: './exam-grading.html',
})
export class ExamGrading {
  readonly initials = studentInitials;
  readonly QuestionType = QuestionType;

  // ── inputs ──────────────────────────────────────────────────────
  /** Whether the modal is visible */
  show = input.required<boolean>();

  /** Bundled grading context (item + attempt). Null while loading. */
  context = input<GradingContext | null>(null);

  /** True while the parent is fetching the attempt */
  loading = input<boolean>(false);

  /** True while the parent is saving the grade */
  saving = input<boolean>(false);

  // ── outputs ─────────────────────────────────────────────────────
  close = output<void>();
  submitGrade = output<GradeSubmitEvent>();
  submitOverride = output<OverrideSubmitEvent>();

  // ── local state (lives here, not in parent) ──────────────────────
  writtenScores = signal<Record<number, number>>({});
  penaltyScore = signal<number>(0);

  // ── computed ────────────────────────────────────────────────────
  liveTotal = computed(() => {
    const ctx = this.context();
    if (!ctx) return 0;

    return ctx.attempt.questions.reduce((sum, q) => {
      if (q.type === QuestionType.Written) {
        return sum + (Number(this.writtenScores()[q.answerId]) || 0);
      }
      return sum + (q.score ?? 0);
    }, 0);
  });

  liveFinalScore = computed(() => {
    const penalty = Number(this.penaltyScore()) || 0;
    return Math.max(0, this.liveTotal() - penalty);
  });

  // ── public API called by parent after it loads the attempt ───────
  /**
   * Pre-fill local state from the freshly loaded attempt.
   * Call this from the parent right after setting `context`.
   */
  initFromAttempt(attempt: GradingAttemptDetail): void {
    this.penaltyScore.set(attempt.penaltyScore ?? 0);

    const existing: Record<number, number> = {};
    attempt.questions
      .filter((q) => q.type === QuestionType.Written && q.score !== null)
      .forEach((q) => {
        existing[q.answerId] = q.score!;
      });
    this.writtenScores.set(existing);
  }

  /** Reset local state when the modal is closed / re-opened */
  reset(): void {
    this.writtenScores.set({});
    this.penaltyScore.set(0);
  }

  // ── template event handlers ──────────────────────────────────────
  onWrittenScoreChange(answerId: number, value: number): void {
    this.writtenScores.update((scores) => ({ ...scores, [answerId]: value }));
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }

  onSubmitGrade(): void {
    const ctx = this.context();
    if (!ctx) return;

    const grades = ctx.attempt.questions
      .filter((q) => q.type === QuestionType.Written)
      .map((q) => ({
        answerId: q.answerId,
        score: Number(this.writtenScores()[q.answerId]) || 0,
      }));

    this.submitGrade.emit({ attemptId: ctx.attempt.attemptId, grades });
  }

  onSubmitOverride(): void {
    const ctx = this.context();
    if (!ctx) return;

    this.submitOverride.emit({
      attemptId: ctx.attempt.attemptId,
      penaltyScore: this.penaltyScore(),
    });
  }
}
