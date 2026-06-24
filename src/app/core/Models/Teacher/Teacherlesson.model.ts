export type LessonStatus = 'active' | 'hidden' | 'drafted';

export interface TeacherLesson {
  id: number;
  name: string;
  price: number;
  students: number;
  status: LessonStatus;
}

export interface DeleteModalState {
  open: boolean;
  lessonId: number | null;
  lessonName: string;
}

export interface UpdatedLesson {
  title: string,
  description: string,
  price: number,
  validityDays: number,
  prerequisiteLessonId: number,
  chapters: Chapter[],
  assignmentEnabled: boolean,
  assignmentDueDate?: Date,
  assignmentFileTypes?: string,
  isPublished: boolean
}
export interface Chapter {
  Name: string;
  VideoFileName?: string;
}
export interface CreatedLesson {
  title: string,
  description: string,
  price: number,
  validityDays: number,
  prerequisiteLessonId: number,
  chapters: Chapter[],
  assignmentEnabled: boolean,
  assignmentDueDate?: Date,
  assignmentFileTypes?: string,
  isPublished: boolean
}