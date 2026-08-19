export type LessonStatus = 'avail' | 'purchased' | 'locked' | 'expired';

export interface Lesson {
  id: number;
  title: string;
  teacherName: string;
  subject: string;
  durationHours: number;
  status: LessonStatus;
  price?: number;
  prerequisiteLabel?: string;
  expiredDate?: string;
  imageThumbnailUrl?: string;
  currency: string;
}
