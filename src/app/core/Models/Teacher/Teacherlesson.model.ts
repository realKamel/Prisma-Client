import { Money } from '../money.model';

export type LessonStatus = 'active' | 'hidden' | 'drafted';
// export type LessonStatus = 'active' | 'hidden' | 'drafted'|'unPublished';

export interface TeacherLesson {
  id: number;
  name: string;
  // price: number;
  money: Money;
  students: number;
  status: LessonStatus;
}

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
