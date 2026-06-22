import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GradingCategory,
  GradingQuestion,
  GradeSavedEvent,
} from '../../../../core/Models/Teacher/teacher-exams-model';
import { toArabicNumerals, studentInitials } from '../../../../core/pipes/arabic-numerals/arabic-numerals';

export interface GradingContext {
  id: string;
  category: GradingCategory;
  studentName: string;
  contextLabel: string; // lesson or exam title
  submitted: string;
  questions?: GradingQuestion[];
  // assignment fields
  fileName?: string;
  fileSize?: string;
}

@Component({
  selector: 'app-exam-grading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-grading.html',
})
export class ExamGradingComponent implements OnChanges {
  @Input() show = false;
  @Input() context: GradingContext | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() gradeSaved = new EventEmitter<GradeSavedEvent>();

  readonly toAr = toArabicNumerals;
  readonly initials = studentInitials;

  /** Written-question scores entered by the teacher, keyed by question num */
  writtenScores = signal<Record<number, number>>({});
  assignScore = signal<number | null>(null);
  notes = signal('');
  saving = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && this.show) {
      this.writtenScores.set({});
      this.assignScore.set(null);
      this.notes.set('');
      this.saving.set(false);
    }
  }

  get isAssign(): boolean {
    return this.context?.category === 'assign';
  }

  autoScore(): number {
    if (!this.context?.questions) return 0;
    return this.context.questions.reduce((sum, q) => {
      if (q.type === 'mcq' && q.studentAnsIndex === q.correctIndex) return sum + 10;
      if (q.type === 'tf' && q.studentAnsBool === q.correctBool) return sum + 10;
      return sum;
    }, 0);
  }

  totalMax(): number {
    if (!this.context?.questions) return 100;
    return this.context.questions.reduce(
      (sum, q) => sum + (q.type === 'written' ? (q.maxScore ?? 15) : 10),
      0,
    );
  }

  liveTotal(): number {
    const written = Object.values(this.writtenScores()).reduce((s, v) => s + (Number(v) || 0), 0);
    return Math.min(this.autoScore() + written, this.totalMax());
  }

  setWrittenScore(num: number, value: number): void {
    this.writtenScores.update((scores) => ({ ...scores, [num]: value }));
  }

  mcqCorrect(q: GradingQuestion): boolean {
    return q.studentAnsIndex === q.correctIndex;
  }

  tfCorrect(q: GradingQuestion): boolean {
    return q.studentAnsBool === q.correctBool;
  }

  onSave(): void {
    this.saving.set(true);
    let finalScore: number;

    if (this.isAssign) {
      finalScore = this.assignScore() ?? 0;
    } else {
      finalScore = Math.round((this.liveTotal() / this.totalMax()) * 100);
    }

    setTimeout(() => {
      this.gradeSaved.emit({
        id: this.context!.id,
        category: this.context!.category,
        score: finalScore,
      });
      this.saving.set(false);
      this.close.emit();
    }, 1200);
  }
}