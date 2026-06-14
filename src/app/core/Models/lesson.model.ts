export interface Chapter {
  id: number;
  title: string;
  duration: string;
  isPreview: boolean;
}

export interface Prerequisite {
  title: string;
  isDone: boolean;
}

export interface LessonResponse {
  id:number
  title: string;
  subject: string;
  teacher: string;
  duration: string;
  chaptersCount: number;
  studentsCount: number;
  price: number;
  validityDays: number;
  aboutText: string;
  outcomes: string[];
  prerequisites: Prerequisite[];
  chapters: Chapter[];
}