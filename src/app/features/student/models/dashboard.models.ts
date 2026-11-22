import { DateRange } from '../../../domain/value-objects/date-range.model';
import { TimeDuration } from '../../../domain/value-objects/time-duration.model';

export type LessonStatus = 'new' | 'progress' | 'done' | 'warn' | 'expired';

export interface DashboardResponse {
  student: StudentDto;
  streak: StreakDto;
  nextLesson?: NextLessonDto;
  lessons: LessonCardDto[];
  stats: StatsDto;
}

// ── Student ──────────────────────────────────
export interface StudentDto {
  firstName: string; // e.g. "حمدي"
  gradeLabel: string; // e.g. "ثانوية ٢"
}

// ── Streak ───────────────────────────────────
export interface StreakDto {
  count: number; // e.g. 5  (streak days)
  // days display is derived fully on the frontend from today's date + count
}

export type StreakTask =
  | { type: 'quiz'; id: number; guidId: null; title: string }
  | { type: 'lessonQuiz'; id: null; guidId: string; title: string }
  | { type: 'assignment'; id: null; guidId: string; title: string }
  | { type: 'practice'; id: null; guidId: null; title: string };
export interface StreakTasks { doneToday: boolean; tasks: StreakTask[]; }
export interface PracticeFinishResult { streakCounted: boolean; }
export interface PracticeChoice { id: number; text: string; }
export interface PracticeQuestion { questionId: number; text: string; choices: PracticeChoice[]; }
export interface PracticeRound { questions: PracticeQuestion[]; practicedToday?: boolean; }
export interface PracticeAnswerRequest { questionId: number; choiceId: number; }
export interface PracticeAnswerResult { isCorrect: boolean; correctChoiceId: number;}

// ── Next Lesson (hero card) ───────────────────
export interface NextLessonDto {
  lessonPublicId: string;
  title: string;
  subject: string; // e.g. "فيزياء"
  teacherName: string; // e.g. "أ. فاطمة علي"
  teacherInitial: string; // e.g. "ف"
  progressPercent: number; // 0-100
  currentChapter: number; // e.g. 3
  totalChapters: number; // e.g. 5
  posterUrl: string; // poster to lesson detail
}

// ── Lesson Cards ──────────────────────────────
export interface LessonCardDto {
  lessonPublicId: string;
  title: string;
  subject: string; // e.g. "فيزياء"
  teacherName: string;
  teacherInitial: string;
  durationLabel: string; // e.g. "٤ ساعة"  — formatted by backend
  status: LessonStatus;
  posterUrl: string; // full image URL
  expiresInDays?: number; // only when status === 'warn', e.g. 3
  duration: TimeDuration;
  validityDateRange: DateRange;
}

// ── Stats strip ───────────────────────────────
export interface StatsDto {
  purchasedLessons: number;
  completedLessons: number;
  studyHours: number;
  topQuizScore: number; // 0-100
}

export type StatKey = keyof StatsDto;

export interface StatPoint {
  date: string; // 'yyyy-MM-dd'
  value: number;
}

/** 60 daily points per stat (oldest → newest) so we can compare against the previous period. */
export type StatsHistoryDto = Record<StatKey, StatPoint[]>;