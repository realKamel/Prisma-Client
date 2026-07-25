export interface GetTeacherDashboardStatusResponse {
  stats: Stats;
  weekEarnings: WeekEarnings;
  bestSales: BestSales[];
  logs: AuditLogDto[];
}

export interface Stats {
  totalEarningsForThisMonth: number;
  totalEarningsAgainstLastMonth: number;
  totalActiveStudents: number;
  totalActiveLessons: number;
  totalCompletedLessonsAgainstThisMonth: number;
  totalCompletedLessonsAgainstLastMonthPercentage: number;
}

export interface WeekEarnings {
  totalEarningsForThisWeek: number;
  data: EarningEntry[];
}

export interface EarningEntry {
  day: string;
  earning: number;
}

export interface BestSales {
  lessonId: number;
  amount: number;
  studentCount: number;
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
export interface DashboardState {
  data: GetTeacherDashboardStatusResponse | null;
  loading: boolean;
  error: string | null;
}
