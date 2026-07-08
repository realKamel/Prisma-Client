// ── Core ─────────────────────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'Teacher' | 'Student' | 'Assistant';

/**
 * Matches Prisma.Application.Features.Users.Dtos.UserListItemDto exactly.
 * This is deliberately thin — it's what GET /users returns and all the
 * users-list table needs (name/email/role/active/joined/lastActive).
 * `id` is a Guid on the backend → string here.
 */
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

/**
 * Matches Prisma.Application.Features.Users.Dtos.UserEditDto exactly.
 * Returned by GET /users/{id} and used to prefill the edit form.
 * NOTE: `role` is present for display only — the backend TPH model means role
 * can't be changed on an existing user, so the role selector must be disabled
 * whenever isEditMode is true (handled in user-form.component.ts).
 */
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
// Mirrors CreateUserCommand / UpdateUserCommand on the backend.
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
/** Matches Prisma.Application.Features.Users.Dtos.TeacherOptionDto. */
export interface TeacherOption {
  id: string;   // Guid
  name: string;
}

/** Matches Prisma.Application.Features.AcademicYears.Dtos.AcademicYearOptionDto. */
export interface GradeOption {
  id: number;
  name: string;
}

// ── Profile page sub-resources (user-profile) ────────────────────────────────
// ⚠ STATUS: There is currently NO aggregated "GET /users/{id}/profile"
// endpoint on the backend. The pieces below map to real DTOs that already
// exist for the STUDENT case (via TeacherStudentsController, which doesn't
// filter by teacher so it works for an arbitrary student id):
//   Lesson    → StudentLessonDto      (GET /teacherstudents/{id}/lessons)
//   Activity  → StudentActivityDto    (GET /teacherstudents/{id}/activities)
//   StatCard  → derived from StudentStatsDto (GET /teacherstudents/{id}/stats)
// Teacher / Admin / Assistant profile views have NO equivalent yet — their
// existing dashboard queries are scoped to "the current logged-in user", not
// an arbitrary target id, so an Admin can't fetch someone else's dashboard
// through them without a new backend query. Not built yet — flagging rather
// than guessing.

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

/** Raw shape of StudentStatsDto — map to StatCard[] client-side (see
 *  user-profile.component.ts) since the backend returns numbers, not
 *  display-ready cards. */
export interface StudentStatsRaw {
  lessons: number;
  avgQuiz: number;
  hours: number;
  pending: number;
}

// The following were part of the original mock and have no backend DTO yet.
// Left in place so the profile template still compiles, but nothing currently
// populates them — do not treat as wired up.
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