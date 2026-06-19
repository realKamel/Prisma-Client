import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizQuestion, StudentAnswer } from '../../../../core/Models/quiz-detail.model';
import { QuestionType } from '../../../../core/enums/quiz-type';

@Component({
    selector: 'app-quiz-question',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './quiz-question.html',
})
export class QuizQuestionComponent {
    @Input() question!: QuizQuestion;
    @Input() index!: number;
    @Input() answer: StudentAnswer | null = null;
    @Output() answered = new EventEmitter<StudentAnswer>();
    QuestionType = QuestionType; 


    get isAnswered(): boolean {
        if (!this.answer) return false;
        if (this.question.type === QuestionType.Written) {
            return (this.answer.textAnswer?.trim().length ?? 0) > 0;
        }
        return this.answer.choiceId !== undefined;
    }

    selectChoice(choiceId: number): void {
        this.answered.emit({ questionId: this.question.questionId, choiceId });
    }

    onTextInput(event: Event): void {
        const text = (event.target as HTMLTextAreaElement).value;
        this.answered.emit({ questionId: this.question.questionId, textAnswer: text });
    }

    isSelected(choiceId: number): boolean {
        return this.answer?.choiceId === choiceId;
    }

    toArabic(n: number): string {
        return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
    }
}
