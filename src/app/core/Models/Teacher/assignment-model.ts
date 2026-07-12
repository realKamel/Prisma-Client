export type AssignmentStatus = 'not_submitted' | 'pending' | 'grading' | 'graded';
export interface AssignmentSubmissionListItem {
  submissionId: number;
  studentId: string;
  studentName: string;
  assignmentId: number;
  lessonTitle: string;
  fileUrl: string | null;
  submittedAt: string | null;
  score: number | null;
  maxScore: number;
  status: AssignmentStatus;
  isBeingGraded: boolean;
  gradingByUserName: string | null;
}

export interface AssignmentSubmissionsResponse {
  items: AssignmentSubmissionListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}



export interface AssignmentSubmissionDetail {
  submissionId: number;
  studentName: string;
  lessonTitle: string;
  submittedAt: string;
  dueDate: string;
  isLateSubmission: boolean;
  fileUrl: string | null;
  maxScore: number;
  currentScore: number | null;
  currentNote: string | null;
}

export interface GradeSubmissionRequest {
  score: number;
  note: string | null;
}
