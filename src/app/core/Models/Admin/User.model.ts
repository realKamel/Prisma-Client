// ── Core ─────────────────────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'Teacher' | 'Student' | 'Assistant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  joined: string;       // "yyyy-MM-dd"
  lastActive: string;   // humanized server-side from UpdatedAt (no real activity
                         // column exists yet — see backend note)
}

export interface UserEditData {
  id: string;
  firstName: string;
  secondName: string | null;
  thirdName: string | null;
  lastName: string;
  mobile: string | null;
  email: string | null;
  role: UserRole;
  gradeId: number | null;      // AcademicYearId — Student only
  teacherId: string | null;    // Guid — Student only. Always null for
                                // Assistant: Assistant→Teacher has no FK in
                                // the DB yet (AssistantConfiguration has it
                                // commented out), so it can't be resolved
                                // without a schema change.
  parentMobile: string | null;
}

// ── Create / Update payloads (user-form) ─────────────────────────────────────
export interface CreateUserPayload {
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  mobile: string;
  email: string;
  password: string;
  role: UserRole;
  gradeId?: number | null;
  teacherId?: string | null;
  parentMobile?: string | null;
}

export interface UpdateUserPayload {
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  mobile: string;
  email: string;
  newPassword?: string | null;   // optional — blank means "keep current"
  gradeId?: number | null;
  teacherId?: string | null;
  parentMobile?: string | null;
  // role intentionally omitted — not editable, see UserEditData note above
}

// ── Dropdown options (user-form) ─────────────────────────────────────────────
export interface TeacherOption {
  id: string;   // Guid
  name: string;
}

export interface GradeOption {
  id: number;
  name: string;
}

// ── Teacher / Assistant / Admin profile data ──────────────────────────────────
export interface RoleProfile {
  name: string;
  stats: StatCard[];
  activities: Activity[];
  permissions?: RolePermission[];  // populated for Assistant only
}

export interface RolePermission {
  name: string;   // raw policy identifier, e.g. "CanManageContent"
  enabled: boolean;
}

export interface Lesson {
  id: number;              // int on the backend, not string
  title: string;
  method: string;          // "مُنح" | "اشتراك ذاتي" (StudentLessonDto.Method)
  grantedBy: string;
  progress: number;
  status: string;
  statusColor: string;
  progressColor: string;
}

export interface Activity {
  message: string;
  time: string;
  dotColor: string;
}

export interface StatCard {
  label: string;
  value: string;
  color: string;
}

export interface StudentStatsRaw {
  lessons: number;
  avgQuiz: number;
  hours: number;
  pending: number;
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

export interface UserProfile {
  user: User;
  stats: StatCard[];
  activities?: Activity[];
  loginRecords?: LoginRecord[];
  lessons?: Lesson[];
  students?: StudentSummary[];
  assistants?: AssistantSummary[];
  quizzes?: Quiz[];
  permissions?: Permission[];
  teachers?: TeacherSummary[];
}