// ─────────────────────────────────────────────────
//  RAW API RESPONSE SHAPES  (what the server returns)
// ─────────────────────────────────────────────────

/** Mirrors Lesson entity fields returned from GET /Lessons/details/:id */
export interface LessonApiResponse {
  id: number;
  title: string;
  description: string;

  /** decimal — e.g. 150.00 */
  price: number;

  /** "HH:MM:SS" TimeSpan string — e.g. "02:40:00" */
  duration: string;

  imageThumbnailUrl: string | null;

  /** ISO 8601 — used to compute expiredDaysAgo client-side */
  endDate: string | null;

  isEligible: boolean;

  academicYears: AcademicYearApi[];
  sections: SectionApi[];
  lessonMaterials: LessonMaterialApi[];

  /** Latest QuizAttempt for the current student — null if never attempted */
  quizAttempt: QuizAttemptApi | null;
}

export interface AcademicYearApi {
  id: number;
  name: string; // e.g. 'فيزياء — الثانوية ٣'
}

export interface SectionApi {
  id: number;
  title: string;
  videos: VideoApi[];
}

export interface VideoApi {
  id: number;
  title: string;
  durationSeconds: number;
}

export interface LessonMaterialApi {
  id: number;
  fileUrl: string;
  /** 'PDF' | 'Image' | 'Doc' | etc. */
  type: string;
}

/** Mirrors QuizAttempt entity */
export interface QuizAttemptApi {
  id: number;
  quizId: number;
  studentId: string;
  /** decimal 0-100 */
  degree: number;
  startedAt: string;
  submittedAt: string | null;
  /** 'Pending' | 'Submitted' | 'Graded' */
  status: 'Pending' | 'Submitted' | 'Graded';
}

/** GET /Lessons/status/:id */
export interface LessonStatusApi {
  /** 0-100 */
  progressPercent: number;
}

// ─────────────────────────────────────────────────
//  VIEW MODELS  (what the components consume)
// ─────────────────────────────────────────────────

export interface LessonStat {
  /** Bootstrap Icons class e.g. 'bi-camera-video' */
  icon: string;
  value: string;
  label: string;
  /** optional CSS variable string e.g. 'var(--star)' */
  valueColor?: string;
}

export interface LessonCardData {
  subjectTag: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;

  /** Computed from Lesson.EndDate vs Date.now() */
  expiredDaysAgo: number;

  /** From LessonStatusApi.progressPercent */
  progressPercent: number;

  /** Built from sections[].videos.length, lessonMaterials, duration, quizAttempt.degree */
  stats: LessonStat[];
}

export interface RenewalPlan {
  /** Formatted from Lesson.Price e.g. 'ج١٥٠' */
  priceLabel: string;
  /** Currency symbol e.g. 'ج' */
  currency: string;
  /** Raw numeric string e.g. '150' — used in button label */
  amount: string;
  /** e.g. '/ ٣٠ يوم' */
  periodLabel: string;
  features: string[];
}

export interface BreadcrumbItem {
  label: string;
  link?: string;
  /** Tailwind color class e.g. 'text-[var(--coral)]' */
  colorClass?: string;
}

export interface AltOption {
  /** Bootstrap Icons class e.g. 'bi-mortarboard' */
  icon: string;
  iconVariant: 'purple' | 'mint' | 'coral';
  name: string;
  subtitle: string;
  link: string;
}

// ─────────────────────────────────────────────────
//  PROMO
// ─────────────────────────────────────────────────

export interface PromoResult {
  code: string;
  valid: boolean;
  message: string;
  /** New price label if discount applied e.g. 'ج١٢٠' */
  newPrice?: string;
}