export type QuizStatus = 'new' | 'pending' | 'done' | 'missed';

export interface QuizListItem {
  quizId: number;
  title: string;
  status: QuizStatus;
  scheduledDate: string | null;
  submittedAt: string | null;
  score: number | null;
  totalDegree: number;
  questionsCount: number;
  durationMinutes: number;
  // UI-only — مش جاي من API، الفرونت بيحسبه
  posterVariant: string;
  iconType: string;
}

export interface QuizStats {
  total: number;
  averageScorePercent: number;
  bestScorePercent: number;
  newCount: number;
  pendingCount: number;
  doneCount: number;
  missedCount: number;
}

export interface StudentQuizzesResponse {
  stats: QuizStats;
  items: QuizListItem[];
}
