export type LessonStatus = 'All' | 'Done' | 'Active' | 'Expired' | 'Suspended';
export type ScoreTier = 'high' | 'mid' | 'low';

// export interface LessonHistoryItem {
//   id: number;
//   title: string;
//   poster: string;
//   posterBg?: string;
//   teacher: string;
//   teacherInitial: string;
//   status: Exclude<LessonStatus, 'all'>;
//   statusLabel: string;
//   dateLabel: string;
//   score?: {
//     value: number;
//     total: number;
//     tier: ScoreTier;
//   };
//   progressPercentage?: number;
//   actionLabel: string;
//   actionLink: string;
// }
export interface StudentHistoryResponse {
  status: Status;
  history: History[];
}
export interface Status {
  totalPurchasedLessons: number;
  completedLessonsCount: number;
  totalStudyCount: number;
  averageQuizDegree: number;
}
export interface History {
  lessonId: number;
  imageUrl: string;
  title: string;
  status: Exclude<LessonStatus, 'All'>;
  purchaseDate: Date;
  finishAt: Date;
  expiresAt?: Date;
  quizDegree: number;
  lessonPercentage: number;
}
