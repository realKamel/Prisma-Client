// activity-log.model.ts

export type ActorRole = 'teacher' | 'assistant' | 'student' | 'admin' | 'system';
export type EventStatus = 'ok' | 'warn' | 'error';
export type RoleFilter = 'all' | ActorRole;

/** نوع الفعل نفسه (insert/update/delete/select) — بيتحدد منه شكل ولون الأيقونة */
export type EventActionType = 'insert' | 'update' | 'delete' | 'select';

export interface ActivityEvent {
  time: string;
  user: string;
  role: ActorRole;
  /** العنوان الرئيسي Bold، زي رسالة activity-item (مثال: "إضافة على التسجيلات") */
  action: string;
  /** سطر ثانوي تحت العنوان، زي subtitle بتاعة activity-item (مرجع العنصر) */
  subtitle: string;
  actionType: EventActionType;
  status: EventStatus;
}

export interface ActivityLogStats {
  totalEvents: number;
  todayEvents: number;
  activeUsers: number;
  alerts: number;
}

export interface ActivityLogResponse {
  stats: ActivityLogStats;
  events: ActivityEvent[];
}

// ── Raw backend shape (GetActivityLogsQuery) ───────────────────

export interface ApiActivityEventDto {
  createdAt: string;
  user: string;
  role: string;
  action: string;
  tableName: string;
  entityId: string;
  /** تفصيلة وصفية مستخرجة من الـ audit snapshot (اسم درس، مبلغ...) — ممكن تكون null */
  detail?: string | null;
}

export interface ApiActivityLogStatsDto {
  totalEvents: number;
  todayEvents: number;
  activeUsers: number;
  alerts: number;
}

export interface ApiActivityLogResponseDto {
  stats: ApiActivityLogStatsDto;
  events: ApiActivityEventDto[];
}