// ── Core ─────────────────────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'Teacher' | 'Student' | 'Assistant';

export interface User {
  id: number;
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  /** Full display name. Populate this on the backend (concat of the 4 name
   *  parts) so the users list / profile header can render it directly. */
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  active: boolean;
  joined: string;       // e.g. "2024-01-15"
  lastActive: string;   // e.g. "منذ 5 دقائق" (humanized on the backend, or compute client-side from a timestamp)
  avatarColor?: string;

  // Student-only
  gradeId?: number | null;
  grade?: string;              // grade display name, resolved server-side
  parentMobile?: string;

  // Student + Assistant
  teacherId?: number | null;
  teacherName?: string;        // resolved server-side
}

// ── Create / Update payloads (user-form) ─────────────────────────────────────
export interface CreateUserPayload {
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  mobile: string;
  email: string;
  password?: string;
  role: UserRole;
  gradeId?: number | null;
  teacherId?: number | null;
  parentMobile?: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

// ── Dropdown options (user-form) ─────────────────────────────────────────────
export interface TeacherOption {
  id: number;
  name: string;
}

export interface GradeOption {
  id: number;
  name: string;
}

// ── Profile page sub-resources (user-profile) ────────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  method: 'اشتراك ذاتي' | 'منح من المعلم';
  grantedBy?: string;
  progress: number;
  status: string;
  statusColor: string;
  progressColor: string;
}

export interface Quiz {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
  status: string;
  statusColor: string;
}

export interface Activity {
  id: string;
  message: string;
  time: string;
  dotColor: string;
}

export interface LoginRecord {
  id: string;
  ip: string;
  device: string;
  time: string;
  location: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface StudentSummary {
  id: string;
  name: string;
  grade: string;
  lessonsCount: number;
  avgQuiz: number;
  active: boolean;
}

export interface AssistantSummary {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export interface TeacherSummary {
  id: string;
  name: string;
  subject: string;
  studentsCount: number;
}

export interface StatCard {
  label: string;
  value: string;
  color: string;
}

/** Single aggregated response for GET /users/:id/profile.
 *  Only the sections relevant to `user.role` need to be populated by the
 *  backend; the rest can be omitted or returned as empty arrays. */
export interface UserProfile {
  user: User;
  stats: StatCard[];
  activities?: Activity[];

  // Admin
  loginRecords?: LoginRecord[];

  // Teacher
  lessons?: Lesson[];
  students?: StudentSummary[];
  assistants?: AssistantSummary[];

  // Student
  quizzes?: Quiz[];

  // Assistant
  permissions?: Permission[];
  teachers?: TeacherSummary[];
}