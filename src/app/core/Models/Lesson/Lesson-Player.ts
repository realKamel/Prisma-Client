export interface LessonPlayerResult {
  id: number;
  subject: string;
  materials: Material[];
  title: string;
  category: string;
  description: string;
  teacher: string;
  validityDays: number;
  videoPoster: string;
  quiz: Quiz | null;
  assignment: Assignment | null;
  sections: Section[];
  outcomes: string[];
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
}

export interface Assignment {
  id: number;
  contentURL: string;
  dueDate: string;
}

export interface Section {
  id: number;
  sectionId: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  contentUrl: string | null;
  progress: number;
  watchedSeconds: number;
  isActive?: boolean;
  status?: 'done' | 'current' | 'upcoming';
}