import { Component, output, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { QuizQuestion, StudentAnswer } from '../../../../../core/Models/quiz-detail.model';
import { QuestionType } from '../../../../../core/enums/question-type';

@Component({
  selector: 'app-quiz-question',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './quiz-question.html',
})
export class QuizQuestionComponent {
  // @Input() question!: QuizQuestion;
  public readonly question = input.required<QuizQuestion>();
  readonly index = input.required<number>();
  readonly answer = input<StudentAnswer | null>(null);
  readonly answered = output<StudentAnswer>();
  QuestionType = QuestionType;
  readonly securityViolation = output<'CopyPasteAttempt'>();

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
