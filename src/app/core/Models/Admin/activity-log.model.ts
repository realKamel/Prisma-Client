// activity-log.model.ts

export type ActorRole = 'teacher' | 'assistant' | 'student' | 'admin' | 'system';
export type EventStatus = 'ok' | 'warn' | 'error';
export type RoleFilter = 'all' | ActorRole;

export interface ActivityEvent {
  time: string;
  user: string;
  role: ActorRole;
  action: string;
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