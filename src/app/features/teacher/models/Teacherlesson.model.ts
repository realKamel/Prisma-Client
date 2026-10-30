import { Money } from '../../../domain/value-objects/money.model';
import { PaginatedList } from '../../../shared/models/paged-result.model';

export type LessonStatus = 'active' | 'hidden' | 'drafted';
// export type LessonStatus = 'active' | 'hidden' | 'drafted'|'unPublished';

export interface DeleteModalState {
  open: boolean;
  lessonId: number | null;
  lessonName: string;
}

export interface UpdatedLesson {
  title: string;
  description?: string;
  price: number;
  validityDays?: number;
  prerequisiteLessonId?: number;
  chapters: ChapterCommandDto[];
  assignmentEnabled: boolean;
  assignmentDueDate?: Date;
  isPublished: boolean;
  academicYearIds: number[];
  outcomes: string[];
}
export interface CreatedLesson {
  title: string;
  description?: string;
  price: number;
  validityDays?: number;
  prerequisiteLessonId?: number;
  chapters: ChapterCommandDto[];
  assignmentEnabled: boolean;
  assignmentDueDate?: Date;
  isPublished: boolean;
  academicYearIds: number[];
  outcomes: string[];
}

export interface ChapterCommandDto {
  name: string;
  videoFileName?: string;
}


export type StatusFilter = 'all' | LessonStatus;

export type TeacherLessonSort =
  | 'newest'
  | 'mostStudents'
  | 'highestRevenue'
  | 'priceHigh'
  | 'priceLow';

export interface TeacherLesson {
  id: number;
  name: string;
  money: Money;
  students: number;
  status: LessonStatus;
  thumbnailUrl: string | null;
  sectionsCount: number;
  durationSeconds: number;
  /** % (0-100) of enrolled students who finished. null when nobody is enrolled. */
  completionRate: number | null;
  /** Completed online payments only, in money.currency. Redeem codes aren't counted yet. */
  revenue: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface StatusCounts {
  all: number;
  active: number;
  hidden: number;
  drafted: number;
}

export interface TeacherLessonsQuery {
  search: string;
  status: StatusFilter;
  sort: TeacherLessonSort;
  page: number;
  pageSize: number;
}

export interface TeacherLessonsResponse {
  lessons: PaginatedList<TeacherLesson>;
  counts: StatusCounts;
}