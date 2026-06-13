// PATH: src/app/core/Models/lesson-model.ts

// Matches the exact string values returned by the backend status switch expression
export type LessonStatus = 'avail' | 'purchased' | 'locked' | 'expired';

export interface Lesson {
  id: number;
  title: string;
  teacherName: string;
  teacherInitial: string;
  subject: string;
  durationHours: number;
  status: LessonStatus;
  price?: number;        // only meaningful when status === 'avail'
  prerequisiteLabel?: string;       // set when status === 'locked'
  expiredDate?: string;        // Arabic string when status === 'expired'
  imageUrl?: string;
  currency: string;        // always "جنيه"
}

// Generic API envelope returned by all Prisma endpoints
export interface ApiResult<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

// ── Static fallback — used when the API is unreachable ────────────────────────
// Shows one card per status so the UI/filtering can be verified offline.
export const STATIC_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'الكهرباء الساكنة — قانون كولوم',
    teacherName: 'أ. أحمد مصطفى',
    teacherInitial: 'أ',
    subject: 'فيزياء',
    status: 'avail',
    price: 50,
    currency: 'جنيه',
    durationHours: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'حركة الأجسام — قوانين نيوتن',
    teacherName: 'أ. أحمد مصطفى',
    teacherInitial: 'أ',
    subject: 'فيزياء',
    status: 'purchased',
    currency: 'جنيه',
    durationHours: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'الدوائر الكهربية — قانون أوم',
    teacherName: 'أ. أحمد مصطفى',
    teacherInitial: 'أ',
    subject: 'فيزياء',
    status: 'locked',
    currency: 'جنيه',
    durationHours: 4,
    prerequisiteLabel: 'تحتاج لإكمال الدرس السابق',
    imageUrl:
      'https://images.unsplash.com/photo-1555664424-778a69022365?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'الموجات الكهرومغناطيسية',
    teacherName: 'أ. أحمد مصطفى',
    teacherInitial: 'أ',
    subject: 'فيزياء',
    status: 'expired',
    currency: 'جنيه',
    durationHours: 4,
    expiredDate: 'انتهت صلاحيتك · انتهت في ١٢ مارس',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
  },
];