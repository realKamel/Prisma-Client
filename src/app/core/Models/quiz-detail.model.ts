// ── Question types ────────────────────────────────────────────────────────────
export type QuestionType = 'mcq' | 'truefalse' | 'written';

export interface QuizChoice {
  id: number;
  text: string;
}

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  title: string;
  choices: QuizChoice[];   // MCQ: 4 choices | TrueFalse: 2 | Written: empty
  degree: number;          // points this question is worth
}

// ── Quiz detail (returned by GET /students/quizzes/:id) ───────────────────────
export interface QuizDetail {
  id: number;
  title: string;
  lessonTitle: string;
  teacherName: string;
  durationMinutes: number;
  totalDegree: number;
  posterVariant: string;
  iconType: string;
  questions: QuizQuestion[];
}

// ── What the student submits (POST /students/quizzes/:id/submit) ──────────────
export interface QuizAnswerPayload {
  questionId: number;
  choiceId?: number;       // MCQ and TrueFalse
  textAnswer?: string;     // Written
}

export interface SubmitQuizPayload {
  answers: QuizAnswerPayload[];
}

// ── Graded result (returned after Graded status) ──────────────────────────────
export interface GradedAnswer {
  questionId: number;
  questionTitle: string;
  questionType: QuestionType;
  choices: QuizChoice[];
  correctChoiceId?: number;
  studentChoiceId?: number;
  studentTextAnswer?: string;
  isCorrect: boolean;
  degree: number;
  scoredDegree: number;
}

export interface QuizResult {
  quizTitle: string;
  score: number;           // percentage 0-100
  totalDegree: number;
  scoredDegree: number;
  correctCount: number;
  wrongCount: number;
  gradedAt?: string;
  answers: GradedAnswer[];
}

// ── Student's in-progress answer (frontend only) ──────────────────────────────
export interface StudentAnswer {
  questionId: number;
  choiceId?: number;
  textAnswer?: string;
}