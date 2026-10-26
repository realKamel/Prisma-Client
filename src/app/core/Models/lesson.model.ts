import { DateRange } from './date-range.model';
import { Money } from './money.model';
import { TimeDuration } from './time-duration.model';

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

/** One chapter the backend stores as a lesson section, in chapter order. */
export interface AddLessonSectionRequest {
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

/**
 * Body of `PUT /sections/{sectionId}/video`.
 * Links a video that was already uploaded to the video provider (Bunny Stream) to a section.
 */
export interface AttachSectionVideoRequest {
  videoId: string;
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
