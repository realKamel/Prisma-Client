export type KpiId = 'students' | 'revenue' | 'lessons-sold' | 'uptime';

/* ============================================================
 * Raw API DTOs — these mirror exactly what the backend returns.
 * ============================================================ */

/** One KPI as returned by GET /api/v1/Admin/stats */
export interface KpiApiDto {
  id: KpiId;
  value: number;
  /** signed percentage change, e.g. 23, -100, 0 */
  delta: number;
}

/** One day of revenue as returned by GET /api/v1/Admin/stats */
export interface RevenuePointApiDto {
  /** ISO 8601 date string */
  date: string;
  amount: number;
  isToday: boolean;
}

/** Body of GET /api/v1/Admin/stats (returned natively, no envelope) */
export interface AdminStatsApiResponseDto {
  /** ISO 8601 date string, server "now" */
  currentDateTime: string;
  kpis: KpiApiDto[];
  weeklyTotal: number;
  revenueWeek: RevenuePointApiDto[];
}

export type ActivityType = 'enroll' | 'payment' | 'alert' | 'teacher' | 'system';

/** One item as returned by GET /api/v1/Admin/activities */
export interface ActivityApiDto {
  id: string;
  type: ActivityType;
  entityId: string;
  details: string;
  metaInfo: string;
  /** ISO 8601 date string */
  activityDate: string;
}

/* ============================================================
 * View models — what the dashboard components actually bind to.
 * Unchanged from before, so templates keep working as-is.
 * ============================================================ */

export interface KpiDto {
  id: KpiId;
  value: number;
  deltaLabel: string;
}

export interface RevenuePointDto {
  day: string;
  amount: number;
  isToday: boolean;
}

export interface ActivityItemDto {
  id: string;
  type: ActivityType;
  message: string;
  subtitle: string;
  time: string;
}

export type SectionCardId = 'finances' | 'support' | 'users';

export interface SectionCardDto {
  id: SectionCardId;
  count: number;
}

export interface AdminDashboardResponseDto {
  pageDateLabel: string;
  kpis: KpiDto[];
  revenueWeek: RevenuePointDto[];
  weeklyTotal: number;
  activity: ActivityItemDto[];
  sectionCards: SectionCardDto[];
}
