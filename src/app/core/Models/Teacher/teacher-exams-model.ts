// ── Enums / union types ───────────────────────────────────────────────────────

import { QuestionType } from '../../enums/question-type';

export type QuizStatus = 'active' | 'pending_grading' | 'completed';
export type SubmissionStatus = 'pending' | 'auto' | 'graded';
export type QuestionSource = 'manual' | 'file';
export type GradingCategory = 'quiz' | 'exam' | 'assign';
export type GradingStatus = 'submitted' | 'graded';

// ── Lookup types ──────────────────────────────────────────────────────────────

export interface Lesson {
  lessonId: number;
  title: string;
}
export interface AcademicYear {
  id: number;
  name: string;
}

// ── Quiz list (GET /api/v1/teacher/quizzes) ───────────────────────────────────

export interface QuizListItem {
  quizId: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  questionsCount: number;
  totalDegree: number;
  availableFrom: string | null;
  dueDate: string | null;
  submittedCount: number;
  pendingGradingCount: number;
  averageScore: number | null;
  status: QuizStatus;
}

export interface TeacherQuizzesListResponse {
  items: QuizListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Question draft (used while building a new quiz/exam) ──────────────────────
export interface QuestionChoice {
  text: string;
  isCorrect: boolean;
}

export interface QuestionDraft {
  id: number; // frontend-only, for tracking
  text: string;
  type: QuestionType;
  degree: number;
  choices: QuestionChoice[]; // mcq: 4 choices; tf: 2 choices; written: []
  modelAnswer: string; // written only
}

// ── Create payload (POST /api/v1/teacher/quizzes) ─────────────────────────────

export interface QuizCreatePayload {
  title: string;
  description: string;
  scope: number;
  lessonId: number | null;
  academicYearId: number | null;
  durationMinutes: number;
  availableFrom: string;
  dueDate: string;
  questions: Omit<QuestionDraft, 'id'>[]; // strip frontend-only id before sending
}

// ── Grading list (GET /api/v1/teacher/grading) ────────────────────────────────
export interface GradingListItem {
  attemptId: number;
  studentId: string;
  studentName: string;
  quizId: number;
  quizTitle: string;
  submittedAt: string;
  status: GradingStatus;
  score: number | null;
  totalDegree: number;
  pendingWrittenCount: number;
  tabSwitchCount: number;
  copyPasteAttemptCount: number;
  heldForSecurityReview: boolean;
}

export interface GradingListResponse {
  items: GradingListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Grading detail (GET /api/v1/teacher/grading/{attemptId}) ─────────────────

export interface GradingChoice {
  choiceId: number;
  text: string;
  isCorrect: boolean;
}

export interface GradingQuestion {
  questionId: number;
  answerId: number;
  text: string;
  type: QuestionType;
  degree: number;
  score: number | null;
  isCorrect: boolean;
  choices: GradingChoice[] | null;
  selectedChoiceId: number | null;
  textAnswer: string | null;
  modelAnswer: string | null;
}

export interface GradingAttemptDetail {
  attemptId: number;
  studentName: string;
  quizTitle: string;
  submittedAt: string;
  totalDegree: number;
  score: number | null;
  penaltyScore: number;
  status: GradingStatus;
  heldForSecurityReview: boolean;
  heldForManualGrading: boolean;
  questions: GradingQuestion[];
}

// ── Grade submit (POST /api/v1/teacher/grading/{attemptId}/grade) ────────────
export interface GradeAnswer {
  answerId: number;
  score: number;
}

export interface GradeSubmitPayload {
  grades: GradeAnswer[];
}

export interface GradeResultDto {
  status: string;
  heldForSecurityReview: boolean;
}

// ── Grading modal event types (shared between exam-grading & teacher-exams) ──

/** Bundled context passed into the grading modal */
export interface GradingContext {
  item: GradingListItem;
  attempt: GradingAttemptDetail;
}

/** Emitted when the teacher submits grades for an exam attempt */
export interface GradeSubmitEvent {
  attemptId: number;
  grades: { answerId: number; score: number }[];
}

/** Emitted when the teacher submits a penalty-score override */
export interface OverrideSubmitEvent {
  attemptId: number;
  penaltyScore: number;
}

/** Emitted when the teacher submits a grade for an assignment */
export interface AssignmentGradeSubmitEvent {
  submissionId: number;
  score: number;
  note: string | null;
}
