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
  id: number;
  url: string;
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

export interface LessonDto {
  name: string;
  id: number;
}

export interface AcademicYearResponse {
  id: number;
  name: string;
}

export interface LessonFormOptionsResponse {
  prerequisitesOptions: LessonDto[];
  allAcademicYearsOptions: AcademicYearResponse[];
}
export interface NewSectionResult {
  sectionId: number;
  chapterIndex: number;
}

export interface CreateLessonResponse {
  lessonId: number; // the editor doesn't read this, so the exact name doesn't matter
  sectionIds: number[];
}

export interface UpdateLessonResponse {
  newSections: NewSectionResult[];
}

export interface LessonEditDetails {
  title: string;
  description: string | null;
  price: number;
  prerequisiteLessonId: number | null;
  imageUrl: string | null;
  outcomes: string[];
  chapters: { name: string; videoFileName: string | null; videoDurationSeconds: number;}[];
  selectedAcademicYears: number[];
  assignmentEnabled: boolean;
  assignmentDueDate: string | null;
  assignmentFileName: string | null;
  allAcademicYearsOptions: { id: number; name: string }[];
  prerequisitesOptions: { id: number; name: string }[];
}