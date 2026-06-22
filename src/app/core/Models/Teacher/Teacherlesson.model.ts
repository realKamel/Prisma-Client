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