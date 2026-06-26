export interface AssistantLessonDto {
  id: number;
  title: string;
  price: number;
  chaptersCount: number;     
  lastUpdatedAt: string;  
  studentsCount: number;
  status: LessonStatus;   
}
export type LessonStatus = 'active' | 'hidden' | 'drafted';

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
  assignmentFileTypes?: string;
  isPublished: boolean;
  academicYearIds: number[];
  outcomes: string[];
  imageUrl?: string;
}

export interface ChapterCommandDto {
  name: string;
  videoFileName?: string;
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
  assignmentFileTypes?: string;
  isPublished: boolean;
  academicYearIds: number[];
  outcomes: string[];
  imageUrl?: string;
}