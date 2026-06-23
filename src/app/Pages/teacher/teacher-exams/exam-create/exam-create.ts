import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { AiExamExtractorService, ExtractionState, ExtractedQuestion } from '../../../../core/Services/ai-exam-extractor.service';

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

  private readonly aiService = inject(AiExamExtractorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly toAr = toArabicNumerals;

  // ── Form State ──
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

  // ── AI Extraction State ──
  extractionState = signal<ExtractionState>('idle');
  extractionProgress = signal(0);
  extractionPhase = signal<string>('');
  extractedQuestionsBuffer = signal<ExtractedQuestion[]>([]);
  currentExtractingQuestion = signal<ExtractedQuestion | null>(null);

  // Computed: is extraction running?
  readonly isExtracting = signal(false);

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
    
    // Reset extraction
    this.extractionState.set('idle');
    this.extractionProgress.set(0);
    this.extractionPhase.set('');
    this.extractedQuestionsBuffer.set([]);
    this.currentExtractingQuestion.set(null);
    this.isExtracting.set(false);
  }

  private makeQuestion(overrides?: Partial<QuestionDraft>): QuestionDraft {
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
      ...overrides,
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

  // ── Question Management ──
  addQuestion(): void {
    this.questions.update((list) => [...list, this.makeQuestion()]);
  }

  removeQuestion(id: number): void {
    this.questions.update((list) => list.filter((q) => q.id !== id));
  }

  setQuestionType(q: QuestionDraft, type: QuestionType): void {
    this.questions.update((list) =>
      list.map((item) => {
        if (item.id !== q.id) return item;
        // Reset type-specific fields when switching
        return {
          ...item,
          type,
          options: type === 'mcq' ? ['', '', '', ''] : item.options,
          correctIndex: type === 'mcq' ? null : item.correctIndex,
          correctBool: type === 'tf' ? null : item.correctBool,
          modelAnswer: type === 'written' ? '' : item.modelAnswer,
        };
      }),
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
      list.map((item) => (item.id === q.id ? { ...item, score: Number(value) || 0 } : item)),
    );
  }

  totalScore(): number {
    return this.questions().reduce((sum, q) => sum + (Number(q.score) || 0), 0);
  }

  // ── File Handling ──
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
    // If we were extracting, cancel it
    if (this.extractionState() === 'extracting') {
      this.cancelExtraction();
    }
  }

  // ── AI Extraction ──
  startAiExtraction(): void {
    const fileName = this.uploadedFileName();
    if (!fileName) return;

    this.extractionState.set('extracting');
    this.isExtracting.set(true);
    this.extractionProgress.set(0);
    this.extractionPhase.set('جاري قراءة الملف...');
    this.extractedQuestionsBuffer.set([]);
    this.currentExtractingQuestion.set(null);

    this.aiService
      .extractQuestionsFromPdf(fileName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (update) => {
          this.extractionProgress.set(update.progress);
          this.extractionPhase.set(update.phase);

          if (update.currentQuestion) {
            this.currentExtractingQuestion.set(update.currentQuestion);
          }

          if (update.completedQuestions) {
            this.extractedQuestionsBuffer.set(update.completedQuestions);
          }

          if (update.state) {
            this.extractionState.set(update.state);
          }
        },
        error: (err) => {
          console.error('Extraction error:', err);
          this.extractionState.set('error');
          this.extractionPhase.set('حدث خطأ أثناء التوليد. يمكنك المحاولة مرة أخرى.');
          this.isExtracting.set(false);
        },
        complete: () => {
          this.extractionState.set('completed');
          this.isExtracting.set(false);
          this.extractionPhase.set('تم الانتهاء!');
          
          // Convert extracted questions to editable format
          this.convertExtractedToQuestions();
        },
      });
  }

  cancelExtraction(): void {
    this.aiService.cancelExtraction();
    this.extractionState.set('idle');
    this.isExtracting.set(false);
    this.extractionProgress.set(0);
    this.extractionPhase.set('');
    this.currentExtractingQuestion.set(null);
  }

  private convertExtractedToQuestions(): void {
    const extracted = this.extractedQuestionsBuffer();
    if (extracted.length === 0) return;

    const converted: QuestionDraft[] = extracted.map((eq, index) => {
      questionIdCounter++;
      const base: QuestionDraft = {
        id: questionIdCounter,
        text: eq.text,
        type: eq.type,
        options: eq.type === 'mcq' ? eq.options : [],
        correctIndex: eq.type === 'mcq' ? eq.correctIndex : null,
        correctBool: eq.type === 'tf' ? eq.correctBool : null,
        modelAnswer: eq.type === 'written' ? eq.modelAnswer : '',
        score: eq.score || 10,
      };
      return base;
    });

    this.questions.set(converted);
    // Switch to manual view so user can edit
    this.questionSource.set('manual');
  }

  // ── Submit ──
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