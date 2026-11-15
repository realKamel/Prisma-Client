// Adjust this path to wherever my-profile.model.ts lives.
import { ContactLinks, ProfileColor } from '../../teacher/models/my-profile.model';
import { Money } from '../../../domain/value-objects/money.model';
import { TimeDuration } from '../../../domain/value-objects/time-duration.model';

/** The teacher's pinned message. Already filtered by the server: only live ones arrive. */
export interface TeacherAnnouncement {
  text: string;
  /** ISO date-time, or null when the teacher didn't set an end. */
  endsAt: string | null;
}

/** One lesson card on the public profile. No status; the page is public and cached. */
export interface ProfileLesson {
  publicId: string;
  title: string;
  duration: TimeDuration;
  money: Money;
  imageThumbnailUrl: string | null;
  studentsCount: number;
  sectionsCount: number;
}

export interface TeacherProfileAcademicYear {
  id: string;
  name: string;
}

/**
 * Public teacher profile (`GET /teachers/{id}/profile`).
 * A null value means the teacher hid it (or never set it): don't render a zero for it.
 */
export interface TeacherProfile {
  id: string;
  firstName: string;
  secondName: string;
  subject: string;
  bio: string | null;
  imageUrl: string | null;
  color: ProfileColor;
  lessonsCount: number | null;
  totalStudents: number | null;
  yearsOfExperience: number | null;
  /** null when hidden or empty. Whatsapp is digits only; the rest are https URLs. */
  links: ContactLinks | null;
  academicYears: TeacherProfileAcademicYear[];
  /** Latest lessons for the cards. Empty when the teacher hides the section. */
  lessons: ProfileLesson[];
  announcement: TeacherAnnouncement | null;
  /** Signed in and not the teacher themselves: show the chat buttons. */
  canMessage: boolean;
  /** Any signed-in visitor, the teacher included. Anonymous visitors get a sign-in step. */
  isSignedIn: boolean;
  featured: boolean;
}