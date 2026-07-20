export type ActionType = 'grant' | 'revoke' | 'view' | 'search';

export interface LogEntry {
  id: number;
  type: ActionType;
  detail: string;
  sub: string;
  student: string;
  grade: string;
  time: string;
  date: string;
  ok: boolean;
}

export interface LogMeta {
  totalThisMonth: number;
  granted: number;
  revoked: number;
  successRate: number;
}

export interface LogResponse {
  meta: LogMeta;
  logs: LogEntry[];
}