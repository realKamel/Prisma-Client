export type LessonStatus = 'All' | 'Done' | 'Active' | 'Expired' | 'Suspended';
export type ScoreTier = 'high' | 'mid' | 'low';

export interface StudentHistoryResponse {
  items: History[];
  pageNumber: number; // 0-based
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface Status {
  totalPurchasedLessons: number;
  completedLessonsCount: number;
  totalStudyCount: number;
  averageQuizDegree: number;
}
export interface History {
  lessonId: string;
  imageUrl: string;
  title: string;
  subject: string;
  teacherName: string;
  status: Exclude<LessonStatus, 'All'>;
  purchaseDate: Date;
  finishAt: Date;
  expiresAt?: Date;
  quizDegree: number;
  lessonPercentage: number;
}
