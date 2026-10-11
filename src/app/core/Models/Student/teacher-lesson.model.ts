import { Lesson, StudentEnrollmentStatus } from '../lesson-model';
import { Money } from '../money.model';
import { TimeDuration } from '../time-duration.model';

/**
 * Student-facing teacher lesson catalog item.
 * Mirrors the backend `LessonCatalogDto` returned by
 * `GET /students/teachers/{id}/lessons`.
 */
export interface TeacherLesson {
  id: number;
  publicId: string;
  title: string | null;
  status: string;
  prerequisiteLabel: string | null;
  expiresAt: string | null;
  teacherName: string | null;
  subject: string | null;
  duration: TimeDuration;
  imageThumbnailUrl: string | null;
  money: Money;
}

const KNOWN_STATUSES: StudentEnrollmentStatus[] = [
  'available',
  'active',
  'suspended',
  'expired',
  'done',
  'locked',
];

/** Normalizes the backend status string onto the shared `LessonStatus` union. */
export function toLessonStatus(status: string): StudentEnrollmentStatus {
  return KNOWN_STATUSES.includes(status as StudentEnrollmentStatus)
    ? (status as StudentEnrollmentStatus)
    : 'locked';
}

/** Maps a backend `LessonCatalogDto` onto the shared `Lesson` model so the
 *  existing `LessonCardComponent` can render it unchanged. */
export function toLesson(dto: TeacherLesson): Lesson {
  return {
    id: dto.id,
    title: dto.title ?? '',
    teacherName: dto.teacherName ?? '',
    subject: dto.subject ?? '',
    duration: dto.duration,
    status: toLessonStatus(dto.status),
    money: dto.money,
    prerequisiteLabel: dto.prerequisiteLabel ?? undefined,
    expiresAt: dto.expiresAt ?? undefined,
    imageThumbnailUrl: dto.imageThumbnailUrl ?? undefined,
  };
}
