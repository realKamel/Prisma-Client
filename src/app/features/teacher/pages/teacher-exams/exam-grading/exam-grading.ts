import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuestionType } from '../../../../../core/enums/question-type';
import { studentInitials } from '../../../../../shared/pipes/arabic-numerals/arabic-numerals';
import {
  GradeSubmitEvent,
  GradingAttemptDetail,
  GradingContext,
  GradingListItem,
  OverrideSubmitEvent,
} from '../../../models/teacher-exams-model';

@Component({
  selector: 'app-exam-grading',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './exam-grading.html',
})
export class ExamGrading {
  readonly initials = studentInitials;
  readonly QuestionType = QuestionType;

  // ── inputs ──────────────────────────────────────────────────────
  items = input.required<GradingListItem[]>(); // جديد: قايمة الطلاب
  selectedId = input<number | null>(null); // جديد: الطالب المحدد
  context = input<GradingContext | null>(null);
  loading = input<boolean>(false);
  saving = input<boolean>(false);

  // ── outputs ─────────────────────────────────────────────────────
  back = output<void>(); // بدل close
  selectStudent = output<GradingListItem>(); // جديد
  submitGrade = output<GradeSubmitEvent>();
  submitOverride = output<OverrideSubmitEvent>();

  // ── local state (lives here, not in parent) ──────────────────────
  // ── local state ──
  writtenScores = linkedSignal<GradingAttemptDetail | undefined, Record<number, number>>({
    source: () => this.context()?.attempt,
    computation: (attempt) => {
      const scores: Record<number, number> = {};
      attempt?.questions
        .filter((q) => q.type === QuestionType.Written && q.score !== null)
        .forEach((q) => (scores[q.answerId] = q.score!));
      return scores;
    },
  });

  penaltyScore = linkedSignal<GradingAttemptDetail | undefined, number>({
    source: () => this.context()?.attempt,
    computation: (attempt) => attempt?.penaltyScore ?? 0,
  });
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

  // ── template event handlers ──────────────────────────────────────
  onWrittenScoreChange(answerId: number, value: number): void {
    this.writtenScores.update((scores) => ({ ...scores, [answerId]: value }));
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
