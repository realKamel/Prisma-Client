import { TimeDuration } from '../../value-objects/time-duration.model';

export interface LessonPlayerResult {
  id: number;
  title: string;
  category: string;
  subject: string;
  enrollmentId: string; // Guid maps to string in TS
  description: string;
  teacher: string;
  validityDays: number;
  videoPoster: string;
  quiz?: Quiz;
  assignment: Assignment | null;
  sections: Section[];
  outcomes: string[];
  isEnrollmentCompleted: boolean;
  materials: Material[];
}

export interface Material {
  title: string;
  type: string;
  downloadUrl: string;
}

export interface Quiz {
  id: number;
  questionsCount: number;
  durationMinutes: number;
  passingScore: number;
  isAttempted: boolean;
}

export interface Assignment {
  id: number;
  contentURL?: string | null;
  dueDate: string | Date; // DateTimeOffset
  fileName: string;
}

export interface Section {
  id: number;
  sectionId: number;
  title: string;
  duration: TimeDuration; // Reuses TimeDurationDto
  isCompleted: boolean;
  contentUrl?: string | null;
  progress: number;
  watchedSeconds: number;
  isActive?: boolean;
  status?: 'done' | 'current' | 'upcoming';
  isLastSection: boolean;
}
export interface AssignmentSubmission {
  title: string;
  fileUrl: string;
  submittedAt: string;
  score: number | null;
  notes: string | null;
}
