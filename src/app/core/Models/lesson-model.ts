import { Money } from './money.model';
import { TimeDuration } from './time-duration.model';

export type StudentEnrollmentStatus =
  'available' | 'active' | 'suspended' | 'expired' | 'done' | 'locked';

export interface Lesson {
  id: number;
  publicId?: string;
  title: string;
  teacherName: string;
  subject: string;
  duration: TimeDuration;
  status: StudentEnrollmentStatus;
  prerequisiteLabel?: string;
  isExpired?: boolean;
  expiresAt?: string;
  imageThumbnailUrl?: string;
  money?: Money;
}
