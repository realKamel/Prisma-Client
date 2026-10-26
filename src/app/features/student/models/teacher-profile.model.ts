import { TeacherAcademicYear } from './teacher.model';

/**
 * Student-facing teacher profile.
 * Mirrors the backend `TeacherProfileDto` returned by
 * `GET /students/teachers/{id}` — a superset of the catalog `Teacher`
 * enriched with profile-only details (bio, experience, audience, etc.).
 */
export interface TeacherProfile {
  id: string;
  firstName: string;
  secondName: string;
  subject: string;
  bio: string | null;
  imageUrl: string | null;
  featured: boolean;
  lessonsCount: number;
  /** Total students who follow / subscribe to this teacher. */
  totalStudents: number;
  /** Years of teaching experience. */
  yearsOfExperience: number | null;
  academicYears: TeacherAcademicYear[];
}
