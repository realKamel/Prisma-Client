export interface Student {
  id: string;
  name: string;
  grade: string;
  lastActive: string;
  lessons: number;
  avgQuiz: number;
  active: boolean;
  phone?: string;
  parentPhone?: string;
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
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  mobile: string;
  email: string;
  password: string;
  grade: number;
  parentMobile: string;
}

export interface GrantLessonRequest {
  studentId: string;
  lessonId: number;
  validityDays: number;
  note?: string;
}

export interface ReportRequest {
  studentIds: string[];
  reportType: string;
  dateFrom: string;
  dateTo: string;
}

export interface Lesson {
  id: number;
  title: string;
  chapters: string;
}

export interface AcademicYear {
  id: number;
  name: string;
}

export const ACADEMIC_YEARS: AcademicYear[] = [
  { id: 1, name: 'الصف الأول الإعدادي' },
  { id: 2, name: 'الصف الثاني الإعدادي' },
  { id: 3, name: 'الصف الثالث الإعدادي' },
  { id: 4, name: 'الصف الأول الثانوي' },
  { id: 5, name: 'الصف الثاني الثانوي' },
  { id: 6, name: 'الصف الثالث الثانوي' },
];