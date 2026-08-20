import { Lesson, LessonStatus } from '../lesson-model';

/**
 * Student-facing teacher lesson catalog item.
 * Mirrors the backend `LessonCatalogDto` returned by
 * `GET /students/teachers/{id}/lessons`.
 */
export interface TeacherLesson {
  id: number;
  title: string | null;
  price: number;
  status: string;
  prerequisiteLabel: string | null;
  expiredDate: string | null;
  teacherName: string | null;
  subject: string | null;
  durationHours: number;
  imageThumbnailUrl: string | null;
  currency: string;
}

const KNOWN_STATUSES: LessonStatus[] = ['avail', 'purchased', 'locked', 'expired'];

/** Normalizes the backend status string onto the shared `LessonStatus` union. */
export function toLessonStatus(status: string): LessonStatus {
  return KNOWN_STATUSES.includes(status as LessonStatus) ? (status as LessonStatus) : 'locked';
}

/** Maps a backend `LessonCatalogDto` onto the shared `Lesson` model so the
 *  existing `LessonCardComponent` can render it unchanged. */
export function toLesson(dto: TeacherLesson): Lesson {
  return {
    id: dto.id,
    title: dto.title ?? '',
    teacherName: dto.teacherName ?? '',
    subject: dto.subject ?? '',
    durationHours: dto.durationHours,
    status: toLessonStatus(dto.status),
    price: dto.price,
    prerequisiteLabel: dto.prerequisiteLabel ?? undefined,
    expiredDate: dto.expiredDate ?? undefined,
    imageThumbnailUrl: dto.imageThumbnailUrl ?? undefined,
    currency: dto.currency,
  };
}
