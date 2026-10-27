import { DateRange } from '../../value-objects/date-range.model';
import { Money } from '../../value-objects/money.model';
import { TimeDuration } from '../../value-objects/time-duration.model';

export interface Chapter {
  id: number;
  title: string;
  duration: TimeDuration;
  isPreview: boolean;
}

export interface AddLessonRequest {
  title: string;
  description?: string | null;
  price: number;
  currency: string;
  prerequisiteLessonId?: number | null;
  assignmentEnabled: boolean;
  assignmentDueDate?: string | null; // ISO 8601 date string (representing DateTimeOffset)
  assignmentGrade?: number | null;
  academicYearIds: number[]; // Representing Guid[]
  outcomes: string[];
  validityDurationInSeconds: number;
}

export interface AddLessonResponse {
  lessonId: string; // Representing Guid
  coverUploadUrl: string;
  assignmentUploadUrl?: string | null;
}

/**
 * Body of `POST /Lessons/{lessonId}/sections`.
 * Creating a section also creates its video and the TUS upload link that points at it.
 */
export interface CreateSectionAndAttachVideoUploadLinkRequest {
  title: string;
  videoDurationInSeconds: number;
  isPreviewable: boolean;
}

export interface RenewSectionUploadVideoLinkRequest {
  videoId: string;
}
export interface Prerequisite {
  title: string;
  isDone: boolean;
}

export interface duration {
  hours: number;
  minutes: number;
  seconds: number;
}
export interface LessonResponse {
  id: number;
  url: string;
  title: string;
  subject: string;
  teacher: string;
  duration?: duration;
  chaptersCount: number;
  studentsCount: number;
  money: Money;
  // validityDays: number;
  validityDateRange?: DateRange;
  aboutText: string;
  outcomes: string[];
  prerequisites: Prerequisite[];
  chapters: Chapter[];
  validityDuration: TimeDuration;
}
export interface LessonDto {
  name: string;
  id: number;
}

export interface AcademicYearResponse {
  id: number;
  name: string;
}

export interface LessonFormOptionsResponse {
  prerequisitesOptions: LessonDto[];
  allAcademicYearsOptions: AcademicYearResponse[];
}
export interface NewSectionResult {
  sectionId: number;
  chapterIndex: number;
}

export interface CreateLessonResponse {
  lessonId: number; // the editor doesn't read this, so the exact name doesn't matter
  sectionIds: number[];
}

export interface UpdateLessonResponse {
  newSections: NewSectionResult[];
}

export interface LessonEditDetails {
  title: string;
  description: string | null;
  price: number;
  money: Money;
  prerequisiteLessonId: number | null;
  imageUrl: string | null;
  outcomes: string[];
  chapters: { name: string; videoFileName: string | null; videoDurationSeconds: number }[];
  selectedAcademicYears: number[];
  assignmentEnabled: boolean;
  assignmentDueDate: string | null;
  assignmentFileName: string | null;
  allAcademicYearsOptions: { id: number; name: string }[];
  prerequisitesOptions: { id: number; name: string }[];
  validityDuration: TimeDuration;
}

export type StudentEnrollmentStatus =
  'available' | 'active' | 'suspended' | 'expired' | 'done' | 'locked';

export interface Lesson {
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

/** Signed TUS credentials for the video attached to a lesson section. */
export interface SectionVideoUploadLink {
  sectionId: string; // Guid
  videoId: string; // Guid
  libraryId: number;
  expirationTime: number;
  signature: string;
}

/** Response of `POST /Lessons/{lessonId}/sections`: the new section together with its upload link. */
export interface CreateSectionAndAttachVideoUploadLinkResponse extends SectionVideoUploadLink {
  sectionSortOrder: number;
}

/** Response of `PATCH /Lessons/{lessonId}/sections/{sectionId}`: a fresh link for the same video. */
export type RenewSectionUploadLinkResponse = SectionVideoUploadLink;
