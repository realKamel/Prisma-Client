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

/** Exact shape the backend endpoint should return. */
export interface ActivityLogResponse {
  stats: ActivityLogStats;
  events: ActivityEvent[];
}
