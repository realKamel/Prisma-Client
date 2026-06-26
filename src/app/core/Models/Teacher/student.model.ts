export interface Student {
  id: number;
  name: string;
  grade: string;
  lastActive: string;
  lessons: number;
  avgQuiz: number;
  active: boolean;
  phone?: string;
  parentPhone?: string;
  notes?: string;
}

export interface StudentLesson {
  id: number;
  title: string;
  method: string;
  grantedBy: string;
  status: string;
  progress: number;
  statusColor: string;
  progressColor: string;
}

export interface StudentActivity {
  message: string;
  time: string;
  dotColor: string;
}

export interface StudentStats {
  lessons: number;
  avgQuiz: number;
  hours: number;
  pending: number;
}

export interface StudentFormData {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  grade: string;
  parentMobile: string;
  notes?: string;
}

export interface GrantLessonRequest {
  studentId: number;
  lessonId: number;
  actionType: 'grant' | 'revoke';
  validityDays?: number;
  note?: string;
}

export interface ReportRequest {
  studentIds: number[];
  reportType: 'attendance' | 'grades' | 'progress';
  dateFrom: string;
  dateTo: string;
}

export interface Lesson {
  id: number;
  title: string;
  chapters: string;
}
