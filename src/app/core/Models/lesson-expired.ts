// ─────────────────────────────────────────────────
//  RAW API RESPONSE SHAPES  (what the server returns)
// ─────────────────────────────────────────────────

/** Mirrors Lesson entity fields returned from GET /Lessons/details/:id */
export interface LessonApiResponse {
  id: number;
  url: string;
  title: string;
  description: string;
  subject:string;
  price: number;
  totalprogress:number;
  duration: string;
  expiredDate: Date;
  chaptersCount: number;
  materialsCount: number;
  degree: number;
  validityDays: number;
  chapters:ChapterDto[];
}
export interface ChapterDto{
  id:number;
  title:string;
  duration:string;
  isPreview:boolean;
}

// ─────────────────────────────────────────────────
//  VIEW MODELS  (what the components consume)
// ─────────────────────────────────────────────────
   export interface LessonStatusApi {
  /** 0-100 */
  expiredDaysAgo :number
  progressPercent: number;
}

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
  priceLabel: string;
  currency: string;
  amount: string;
  periodLabel: string;
  features: string[];
}

export interface BreadcrumbItem {
  label: string;
  link?: string;
  colorClass?: string;
}

export interface AltOption {
  icon: string;
  iconVariant: 'purple' | 'mint' | 'coral';
  name: string;
  subtitle: string;
  link: string;
}

export interface PromoResult {
  code: string;
  valid: boolean;
  message: string;
  newPrice?: string;
}