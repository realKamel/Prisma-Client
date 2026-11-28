import type { DriveStep } from 'driver.js';

export const TOUR_KEYS = {
  student: {
    welcome: 'student-welcome',
    teachers: 'student-teachers',
    lessons: 'student-lessons',
    purchase: 'student-purchase',
    player: 'student-player',
    quiz: 'student-quiz',
    practice: 'student-practice',
    history: 'student-history',
  },
  teacher: {
    welcome: 'teacher-welcome',
  },
  assistant: {
    welcome: 'assistant-welcome',
  },
} as const;

export type TourKey =
  | (typeof TOUR_KEYS.student)[keyof typeof TOUR_KEYS.student]
  | (typeof TOUR_KEYS.teacher)[keyof typeof TOUR_KEYS.teacher]
  | (typeof TOUR_KEYS.assistant)[keyof typeof TOUR_KEYS.assistant];

type PopoverConfig = NonNullable<DriveStep['popover']>;

export interface TourStep {
  /** Usually [data-tour-step="..."] */
  element: string;
  titleKey: string;
  descriptionKey: string;
  side?: PopoverConfig['side'];
  align?: PopoverConfig['align'];
  icon?: string;
  motion?: 'float' | 'flicker' | 'pulse';
  interactive?: boolean; 
}
export type TourStateStatus = 'idle' | 'loading' | 'ready' | 'failed';

export interface TourState {
  userId: string | null;
  status: TourStateStatus;
  seenTours: ReadonlySet<string>;
}