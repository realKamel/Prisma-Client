/**
 * Student-facing teacher catalog model.
 * Mirrors the shape of the backend `TeacherDto`.
 */
export interface TeacherAcademicYear {
  id: string; // Guid
  name: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  secondName: string;
  subject: string;
  lessonsCount: number;
  featured: boolean;
  imageUrl?: string;
  academicYears: TeacherAcademicYear[];
}

/** Filter chips available on the teacher catalog page. */
export type TeacherFilterKey = 'all' | 'featured';
