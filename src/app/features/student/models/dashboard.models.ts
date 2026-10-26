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
