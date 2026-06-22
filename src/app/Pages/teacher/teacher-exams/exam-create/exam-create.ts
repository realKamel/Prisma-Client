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
  AcademicYear,
  ExamCreatePayload,
  ExamScope,
  Lesson,
  QuestionDraft,
  QuestionSource,
  QuestionType,
} from '../../../../core/Models/Teacher/teacher-exams-model';
import { toArabicNumerals } from '../../../../core/pipes/arabic-numerals/arabic-numerals';

let questionIdCounter = 0;

@Component({
  selector: 'app-exam-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-create.html',
})
export class ExamCreateComponent implements OnChanges {
  @Input() show = false;
  @Input() lessons: Lesson[] = [];
  @Input() academicYears: AcademicYear[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<ExamCreatePayload>();

  readonly toAr = toArabicNumerals;

  title = signal('');
  instructions = signal('');
  scope = signal<ExamScope>('full');
  academicYearId = signal<number | null>(null);
  lessonId = signal<number | null>(null);
  availableFrom = signal('');
  dueDate = signal('');
  duration = signal(30);
  questionSource = signal<QuestionSource>('manual');
  questions = signal<QuestionDraft[]>([]);
  uploadedFileName = signal<string | null>(null);
  showUploadConfirm = signal(false);
  titleError = signal(false);
  submitting = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && this.show) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.title.set('');
    this.instructions.set('');
    this.scope.set('full');
    this.academicYearId.set(this.academicYears[this.academicYears.length - 1]?.id ?? null);
    this.lessonId.set(this.lessons[0]?.id ?? null);
    this.availableFrom.set('');
    this.dueDate.set('');
    this.duration.set(30);
    this.questionSource.set('manual');
    this.uploadedFileName.set(null);
    this.showUploadConfirm.set(false);
    this.titleError.set(false);
    this.submitting.set(false);
    this.questions.set([this.makeQuestion(), this.makeQuestion()]);
  }

  private makeQuestion(): QuestionDraft {
    questionIdCounter++;
    return {
      id: questionIdCounter,
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctIndex: null,
      correctBool: null,
      modelAnswer: '',
      score: 10,
    };
  }

  setScope(scope: ExamScope): void {
    this.scope.set(scope);
    if (scope === 'lesson' && this.lessonId() === null) {
      this.lessonId.set(this.lessons[0]?.id ?? null);
    }
    if (scope === 'full' && this.academicYearId() === null) {
      this.academicYearId.set(this.academicYears[this.academicYears.length - 1]?.id ?? null);
    }
  }

  addQuestion(): void {
    this.questions.update((list) => [...list, this.makeQuestion()]);
  }

  removeQuestion(id: number): void {
    this.questions.update((list) => list.filter((q) => q.id !== id));
  }

  setQuestionType(q: QuestionDraft, type: QuestionType): void {
    this.questions.update((list) =>
      list.map((item) => (item.id === q.id ? { ...item, type } : item)),
    );
  }

  setMcqCorrect(q: QuestionDraft, idx: number): void {
    this.questions.update((list) =>
      list.map((item) => (item.id === q.id ? { ...item, correctIndex: idx } : item)),
    );
  }

  setTfCorrect(q: QuestionDraft, val: boolean): void {
    this.questions.update((list) =>
      list.map((item) => (item.id === q.id ? { ...item, correctBool: val } : item)),
    );
  }

  updateQuestionText(q: QuestionDraft, value: string): void {
    this.questions.update((list) =>
      list.map((item) => (item.id === q.id ? { ...item, text: value } : item)),
    );
  }

  updateOption(q: QuestionDraft, idx: number, value: string): void {
    this.questions.update((list) =>
      list.map((item) => {
        if (item.id !== q.id) return item;
        const options = [...item.options];
        options[idx] = value;
        return { ...item, options };
      }),
    );
  }

  updateModelAnswer(q: QuestionDraft, value: string): void {
    this.questions.update((list) =>
      list.map((item) => (item.id === q.id ? { ...item, modelAnswer: value } : item)),
    );
  }

  updateScore(q: QuestionDraft, value: number): void {
    this.questions.update((list) =>
      list.map((item) => (item.id === q.id ? { ...item, score: value } : item)),
    );
  }

  totalScore(): number {
    return this.questions().reduce((sum, q) => sum + (Number(q.score) || 0), 0);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadedFileName.set(file.name);
    this.showUploadConfirm.set(true);
    setTimeout(() => this.showUploadConfirm.set(false), 3500);
  }

  removeUploadedFile(): void {
    this.uploadedFileName.set(null);
    this.showUploadConfirm.set(false);
  }

  onSubmit(): void {
    if (!this.title().trim()) {
      this.titleError.set(true);
      return;
    }
    if (this.questionSource() === 'file') return;
    this.titleError.set(false);
    this.submitting.set(true);
    setTimeout(() => {
      this.created.emit({
        title: this.title().trim(),
        instructions: this.instructions().trim(),
        scope: this.scope(),
        academicYearId: this.scope() === 'full' ? this.academicYearId() : null,
        lessonId: this.scope() === 'lesson' ? this.lessonId() : null,
        availableFrom: this.availableFrom(),
        dueDate: this.dueDate(),
        duration: this.duration(),
        questionSource: this.questionSource(),
        questions: this.questions(),
        file: null,
      });
      this.submitting.set(false);
    }, 1200);
  }
}