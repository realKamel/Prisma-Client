// ---- Main dashboard: GET Teachers/new-dashboard -------------------------------------------------
export interface GetTeacherDashboardResponse {
  stats: Stats;
  bestSales: BestSales[];
  logs: AuditLogDto[];
  recentSales: RecentSale[];
  attention: Attention;
}

// The percent field is a real change vs. the previous 30 days; null when there is nothing to compare.
export interface Stats {
  totalActiveStudents: number;
  totalActiveLessons: number;
  totalCompletedLessonsAgainstThisMonth: number;
  totalCompletedLessonsAgainstLastMonthPercentage: number | null;
  overallCompletionRate: number; // 0-100
}

export interface BestSales {
  lessonId: number;
  amount: number;
  studentCount: number;
  lessonTitle: string | null;
  completionRate: number; // 0-100
}

export interface RecentSale {
  lessonId: number;
  lessonTitle: string | null;
  amount: number;
  createdAt: string;
}

export interface Attention {
  assignmentsToGrade: number;
  quizzesToGrade: number;
  unreadMessages: number;
  lessonsWithoutEnrollments: number;
  draftLessons: number;
}

export interface AuditLogDto {
  id: number;
  userEmail: string;
  action: Action | string;
  tableName: string;
  createdAt: string | null;
}

export enum Action {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// ---- Graph: GET Teachers/new-dashboard-graph (cached on the server) -----------------------------
export interface GetTeacherDashboardGraphResponse {
  stats: GraphStats;
  earnings: Earnings;
}

export interface GraphStats {
  totalEarningsForThisMonth: number;
  totalEarningsAgainstLastMonth: number | null;
}

export interface Earnings {
  daily: EarningEntry[];
}

/** One entry per Cairo day, oldest -> newest, 60 entries, zero-filled. */
export interface EarningEntry {
  date: string; // 'yyyy-MM-dd'
  earning: number;
  enrollments: number;
}

// ---- Store state --------------------------------------------------------------------------------
export interface DashboardState {
  data: GetTeacherDashboardResponse | null;
  loading: boolean;
  error: string | null;
}

export interface GraphState {
  data: GetTeacherDashboardGraphResponse | null;
  loading: boolean;
  error: string | null;
}