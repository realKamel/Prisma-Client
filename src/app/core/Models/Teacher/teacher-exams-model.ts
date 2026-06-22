export type ExamStatus = 'sent' | 'done';
export type SubmissionStatus = 'pending' | 'auto' | 'graded';
export type AssignmentStatus = 'pending' | 'graded';
export type QuestionType = 'mcq' | 'tf' | 'written';
export type ExamScope = 'full' | 'lesson';
export type QuestionSource = 'manual' | 'file';
export type GradingCategory = 'quiz' | 'exam' | 'assign';

export interface Lesson {
  id: number;
  title: string;
}

export interface AcademicYear {
  id: number;
  label: string; // e.g. "٢٠٢٥ / ٢٠٢٦"
}

export interface ExamRow {
  id: number;
  title: string;
  date: string;
  students: number;
  pending: number;
  avg: number | null;
  status: ExamStatus;
}

/** Shared row shape for quiz submissions + exam result submissions */
export interface SubmissionRow {
  id: string;
  student: string;
  /** lesson name for quizzes, exam title for exam results */
  context: string;
  qtypes: QuestionType[];
  submitted: string;
  score: number | null;
  status: SubmissionStatus;
  pendingWritten: number;
}

export interface AssignmentRow {
  id: string;
  student: string;
  lesson: string;
  file: string;
  size: string;
  submitted: string;
  score: number | null;
  status: AssignmentStatus;
}

/** A single question while the teacher is building a new exam/quiz */
export interface QuestionDraft {
  id: number;
  text: string;
  type: QuestionType;
  options: string[];
  correctIndex: number | null;
  correctBool: boolean | null;
  modelAnswer: string;
  score: number;
}

export interface ExamCreatePayload {
  title: string;
  instructions: string;
  scope: ExamScope;
  academicYearId: number | null; // used when scope === 'full'
  lessonId: number | null;       // used when scope === 'lesson'
  availableFrom: string;
  dueDate: string;
  duration: number;
  questionSource: QuestionSource;
  questions: QuestionDraft[];
  file: File | null;
}

/** A question shown inside the grading modal, with the student's submitted answer */
export interface GradingQuestion {
  num: number;
  type: QuestionType;
  text: string;
  options?: string[];
  correctIndex?: number;
  correctBool?: boolean;
  studentAnsIndex?: number;
  studentAnsBool?: boolean;
  studentAnswer?: string;
  maxScore?: number;
}

export interface GradeSavedEvent {
  id: string;
  category: GradingCategory;
  score: number;
}