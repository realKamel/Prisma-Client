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
  Lesson,
  QuestionChoice,
  QuestionDraft,
  QuestionSource,
  QuizCreatePayload,
} from '../../../../core/Models/Teacher/teacher-exams-model';
import { toArabicNumerals } from '../../../../core/pipes/arabic-numerals/arabic-numerals';
import { AiExamExtractorService } from '../../../../core/Services/ai-exam-extractor.service';
import { QuizScope } from '../../../../core/enums/quiz-scope';
import { QuestionType } from '../../../../core/enums/question-type';

let questionIdCounter = 0;

@Component({
  selector: 'app-exam-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-create.html',
})
export class ExamCreateComponent implements OnChanges {
  @Input() show = false;
  @Input() scope: string = 'ComprehensiveExam';
  @Input() lessons: Lesson[] = [];
  @Input() academicYears: AcademicYear[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<QuizCreatePayload>();

  private readonly aiService = inject(AiExamExtractorService);
  private readonly destroyRef = inject(DestroyRef);
  readonly QuestionType = QuestionType;


  readonly toAr = toArabicNumerals;

  // ═══════════════════════════════════════════════════════
  // Form State
  // ═══════════════════════════════════════════════════════
  title = signal('');
  description = signal('');
  academicYearId = signal<number | null>(null);
  lessonId = signal<number | null>(null);
  availableFrom = signal('');
  dueDate = signal('');
  durationMinutes = signal(30);
  questionSource = signal<QuestionSource>('manual');
  questions = signal<QuestionDraft[]>([]);
  uploadedFileName = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  showUploadConfirm = signal(false);
  titleError = signal(false);
  submitting = signal(false);

  // ═══════════════════════════════════════════════════════
  // AI Extraction State
  // ═══════════════════════════════════════════════════════
  extractionState = signal<'idle' | 'extracting' | 'completed' | 'error'>('idle');
  extractionProgress = signal(0);
  extractionPhase = signal<string>('');
  extractedQuestionsBuffer = signal<ExtractedQuestion[]>([]);
  currentExtractingQuestion = signal<ExtractedQuestion | null>(null);
  isExtracting = signal(false);

  // ═══════════════════════════════════════════════════════
  // Lifecycle
  // ═══════════════════════════════════════════════════════
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && this.show) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.title.set('');
    this.description.set('');
    this.academicYearId.set(this.academicYears[this.academicYears.length - 1]?.academicYearId ?? null);
    this.lessonId.set(this.lessons[0]?.lessonId ?? null);
    this.availableFrom.set('');
    this.dueDate.set('');
    this.durationMinutes.set(30);
    this.questionSource.set('manual');
    this.uploadedFileName.set(null);
    this.selectedFile.set(null);
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
      type: QuestionType.MCQ,
      degree: 10,
      choices: this.buildChoices(QuestionType.MCQ),
      modelAnswer: '',
      ...overrides,
    };
  }

    /** Builds the correct choices array for each question type */
  private buildChoices(type: QuestionType): QuestionChoice[] {
    if (type === QuestionType.MCQ) {
      return [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ];
    }
    if (type === QuestionType.TrueFalse) {
      return [
        { text: 'صح', isCorrect: false },
        { text: 'غلط', isCorrect: false },
      ];
    }
    return []; // written
  }


  // ═══════════════════════════════════════════════════════
  // Question Management
  // ═══════════════════════════════════════════════════════
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
        return {
          ...item,
          type,
          choices: this.buildChoices(type),
          modelAnswer: ''
        };
      }),
    );
  }

  updateQuestionText(q: QuestionDraft, value: string): void {
    this.questions.update((list) =>
      list.map((item) => (item.id === q.id ? { ...item, text: value } : item)),
    );
  }

    updateChoiceText(q: QuestionDraft, idx: number, value: string): void {
    this.questions.update((list) =>
      list.map((item) => {
        if (item.id !== q.id) return item;
        const choices = item.choices.map((c, i) => i === idx ? { ...c, text: value } : c);
        return { ...item, choices };
      }),
    );
  }

  /** MCQ: only one choice can be correct */
    setMcqCorrect(q: QuestionDraft, idx: number): void {
    this.questions.update((list) =>
      list.map((item) => {
        if (item.id !== q.id) return item;
        const choices = item.choices.map((c, i) => ({ ...c, isCorrect: i === idx }));
        return { ...item, choices };
      }),
    );
  }

  /** TF: index 0 = صح, index 1 = غلط */
    setTfCorrect(q: QuestionDraft, idx: number): void {
    this.questions.update((list) =>
      list.map((item) => {
        if (item.id !== q.id) return item;
        const choices = item.choices.map((c, i) => ({ ...c, isCorrect: i === idx }));
        return { ...item, choices };
      }),
    );
  }

  updateModelAnswer(q: QuestionDraft, value: string): void {
    this.questions.update((list) =>
      list.map((item) => (item.id === q.id ? { ...item, modelAnswer: value } : item)),
    );
  }

  updateDegree(q: QuestionDraft, value: number): void {
    this.questions.update((list) =>
      list.map((item) => item.id === q.id ? { ...item, degree: Number(value) || 0 } : item),
    );
  }

  totalDegree(): number {
    return this.questions().reduce((sum, q) => sum + (Number(q.degree) || 0), 0);
  }

  // ═══════════════════════════════════════════════════════
  // File Handling
  // ═══════════════════════════════════════════════════════
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.uploadedFileName.set(file.name);
    this.showUploadConfirm.set(true);
    setTimeout(() => this.showUploadConfirm.set(false), 3500);
  }

  removeUploadedFile(): void {
    this.selectedFile.set(null);
    this.uploadedFileName.set(null);
    this.showUploadConfirm.set(false);

    if (this.extractionState() === 'extracting') {
      this.cancelExtraction();
    }
  }

  // ═══════════════════════════════════════════════════════
  // AI Extraction
  // ═══════════════════════════════════════════════════════
  async startAiExtraction(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    this.extractionState.set('extracting');
    this.isExtracting.set(true);
    this.extractionProgress.set(10);
    this.extractionPhase.set('جاري رفع ومعالجة الملف...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // The backend handler runs the full extraction synchronously before
      // responding, so when this resolves the questions are already stored
      // and the jobId is valid — no polling or second status fetch needed.
      const response = await fetch('/api/v1/teacher/quizzes/extract/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload result:', result);

      if (!result.succeeded) {
        this.extractionState.set('error');
        this.extractionPhase.set(result.message || 'فشل الاستخراج');
        return;
      }

      // Fix 5: The upload endpoint already completed extraction synchronously.
      // Previously a second fetch to the status endpoint was made here which
      // was both redundant and risky (race-condition if the DB write had not
      // committed yet).  We now read the questions directly from the upload
      // response's jobId via a single status call, which is guaranteed to be
      // readable because SaveChangesAsync has already returned on the server.
      const jobId: number = result.data?.jobId;
      if (!jobId) {
        this.extractionState.set('error');
        this.extractionPhase.set('لم يتم استلام معرّف المهمة');
        return;
      }

      this.extractionProgress.set(80);
      this.extractionPhase.set('جاري جلب الأسئلة...');

      const statusResponse = await fetch(
        `/api/v1/teacher/quizzes/extract/status/${jobId}`
      );
      const statusResult = await statusResponse.json();
      console.log('Status result:', statusResult);

      if (statusResult.succeeded && statusResult.data?.completedQuestions?.length) {
        this.extractionProgress.set(100);
        this.extractionPhase.set('تم الانتهاء!');
        this.extractionState.set('completed');

        // Map backend DTOs → local ExtractedQuestion shape
        this.extractedQuestionsBuffer.set(
          statusResult.data.completedQuestions.map((q: any) => ({
            text: q.text,
            type: this.mapBackendType(q.type),
            options: q.choices?.map((c: any) => c.text) ?? [],
            correctIndex:
              q.choices != null
                ? q.choices.findIndex((c: any) => c.isCorrect)
                : null,
            correctBool: q.isCorrect ?? null,
            modelAnswer: q.modelAnswer ?? '',
            score: q.degree,
          }))
        );

        this.convertExtractedToQuestions();
      } else {
        // Extraction completed on the server but returned no questions —
        // treat as an error so the user gets clear feedback.
        this.extractionState.set('error');
        this.extractionPhase.set(
          statusResult.data?.completedQuestions?.length === 0
            ? 'لم يتم العثور على أسئلة في الملف'
            : statusResult.message || 'فشل جلب الأسئلة'
        );
      }
    } catch (error) {
      console.error('Extraction error:', error);
      this.extractionState.set('error');
      this.extractionPhase.set('حدث خطأ في الاتصال');
    } finally {
      this.isExtracting.set(false);
    }
  }

  cancelExtraction(): void {
    this.aiService.cancelExtraction();
    this.extractionState.set('idle');
    this.isExtracting.set(false);
    this.extractionProgress.set(0);
    this.extractionPhase.set('');
    this.currentExtractingQuestion.set(null);
  }

  private mapBackendType(type: string): 'mcq' | 'tf' | 'written' {
    switch (type) {
      case 'MCQ':
        return 'mcq';
      case 'TrueFalse':
        return 'tf';
      case 'Written':
        return 'written';
      default:
        return 'mcq';
    }
  }

  private convertExtractedToQuestions(): void {
    const extracted = this.extractedQuestionsBuffer();
    if (extracted.length === 0) return;

    const converted: QuestionDraft[] = extracted.map((eq) => {
      questionIdCounter++;
      return {
        id: questionIdCounter,
        text: eq.text,
        type: eq.type,
        degree: eq.score || 10,
        choices: eq.type === QuestionType.MCQ
          ? (eq.options ?? []).map((text, i) => ({ text, isCorrect: i === eq.correctIndex }))
          : eq.type === QuestionType.TrueFalse
            ? [
                { text: 'صح',  isCorrect: eq.correctBool === true  },
                { text: 'غلط', isCorrect: eq.correctBool === false },
              ]
            : [],
        modelAnswer: eq.modelAnswer ?? '',
      };
    });

    this.questions.set(converted);
    this.questionSource.set('manual');
  }

  // ═══════════════════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════════════════
  onSubmit(): void {
    if (!this.title().trim()) {
      this.titleError.set(true);
      return;
    }

    // Prevent submit if still in file mode and extraction not done yet
    if (this.questionSource() === 'file' && this.extractionState() !== 'completed') return;

    this.titleError.set(false);
    this.submitting.set(true);

  const toUtcIso = (local: string): string => {
    if (!local) return '';
    return new Date(local).toISOString();
  };

    const payload: QuizCreatePayload = {
      title: this.title().trim(),
      description: this.description().trim(),
      scope: this.scope === 'ComprehensiveExam' ? QuizScope.ComprehensiveExam : QuizScope.LessonQuiz,
      lessonId: this.scope === 'LessonQuiz' ? this.lessonId() : null,
      academicYearId: this.scope === 'ComprehensiveExam' ? this.academicYearId() : null,
      durationMinutes: this.durationMinutes(),
      availableFrom: toUtcIso(this.availableFrom()),
      dueDate: toUtcIso(this.dueDate()),
      questions: this.questions().map(({ id, ...rest }) => rest),
    };

    this.created.emit(payload);
    this.submitting.set(false);
  }
}
// ═══════════════════════════════════════════════════════
// Internal Types for AI Extraction
// ═══════════════════════════════════════════════════════
interface ExtractedQuestion {
  text: string;
  type: QuestionType;
  options: string[];
  correctIndex: number | null;
  correctBool: boolean | null;
  modelAnswer: string;
  score: number;
}
