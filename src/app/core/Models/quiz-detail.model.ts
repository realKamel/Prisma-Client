import { QuestionType } from '../enums/quiz-type';

// ────────────────────────────────────────────────
// Taking (GET /student/quizzes/{quizId})
// ────────────────────────────────────────────────
export interface QuizChoice {
  choiceId: number;
  text: string;
}

export interface QuizQuestion {
  questionId: number;
  text: string;
  type: QuestionType; // 1=MCQ | 2=TrueFalse | 3=Written
  degree: number;
  choices: QuizChoice[] | null;
  selectedChoiceId: number | null;  // إجابة محفوظة مسبقاً
  savedTextAnswer: string | null;
}

export interface QuizTaking {
  attemptId: number;
  quizId: number;
  title: string;
  teacherName: string | null;
  subject: string | null;
  durationMinutes: number;
  remainingSeconds: number;
  questions: QuizQuestion[];

}
// ────────────────────────────────────────────────
// Submit (POST /student/quizzes/attempts/{attemptId}/submit)
// ────────────────────────────────────────────────
export interface SubmitQuizResponse {
  status: 'graded' | 'submitted';
  score: number | null;
  totalDegree: number;
}

// ────────────────────────────────────────────────
// Save answer (PATCH /student/quizzes/attempts/{attemptId}/answer)
// ────────────────────────────────────────────────
export interface SaveAnswerRequest {
  questionId: number;
  choiceId: number | null;
  textAnswer: string | null;
}

// ────────────────────────────────────────────────
// Result (GET /student/quizzes/{quizId}/result)
// ────────────────────────────────────────────────
export interface ReviewChoice {
  choiceId: number;
  text: string;
  isCorrect: boolean;
}

export interface ReviewQuestion {
  questionId: number;
  text: string;
  type: QuestionType;
  choices: ReviewChoice[] | null;
  selectedChoiceId: number | null;
  textAnswer: string | null;
  correctWrittenAnswer: string | null;
  isCorrect: boolean | null;
  score: number | null;
  degree: number;
}

export interface QuizResult {
  quizId: number;
  title: string;
  status: 'pending' | 'done';
  score: number | null;
  totalDegree: number;
  correctCount: number;
  wrongCount: number;
  pendingCount: number;
  gradedAt: string | null;
  review: ReviewQuestion[] | null; // null لو status == 'pending'
}

// ── Student's in-progress answer (frontend only) ──────────────────────────────
export interface StudentAnswer {
  questionId: number;
  choiceId?: number;
  textAnswer?: string;
}
