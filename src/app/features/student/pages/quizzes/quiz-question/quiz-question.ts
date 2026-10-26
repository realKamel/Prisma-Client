import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { QuestionType } from '../../../../../core/enums/question-type';
import { QuizQuestion, StudentAnswer } from '../models/quiz-detail.model';

@Component({
  selector: 'app-quiz-question',
  imports: [FormsModule, DecimalPipe, NgmMotionDirective],
  templateUrl: './quiz-question.html',
})
export class QuizQuestionComponent {
  // @Input() question!: QuizQuestion;
  public readonly question = input.required<QuizQuestion>();
  readonly index = input.required<number>();
  readonly answer = input<StudentAnswer | null>(null);
  readonly saveStatus = input<'pending' | 'saving' | 'saved' | 'failed'>('saved');

  readonly answered = output<StudentAnswer>();
  readonly securityViolation = output<'CopyPasteAttempt'>();
  readonly retrySave = output<number>();

  readonly maxTextLength = 10_000;

  QuestionType = QuestionType;

  get isAnswered(): boolean {
    const answer = this.answer();
    if (!answer) return false;
    if (this.question()?.type === QuestionType.Written) {
      return (answer.textAnswer?.trim().length ?? 0) > 0;
    }
    return answer.choiceId !== undefined;
  }

  selectChoice(choiceId: number): void {
    this.answered.emit({ questionId: this.question().questionId, choiceId });
  }

  onTextInput(event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.answered.emit({ questionId: this.question().questionId, textAnswer: text });
  }

  isSelected(choiceId: number): boolean {
    return this.answer()?.choiceId === choiceId;
  }

  preventCopyPaste(event: ClipboardEvent): void {
    event.preventDefault();
    this.securityViolation.emit('CopyPasteAttempt');
  }

  preventContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }
}
