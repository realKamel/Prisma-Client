export interface DashboardTeacher {
  name: string;
  supervisorName: string;
}

export interface KpiTile {
  id: string;
  label: string;
  value: number;
  unit: string;
  delta: string;
  trend: 'up' | 'down';
  variant: 'purple' | 'mint' | 'star' | 'coral';
}

export interface ActivityItem {
  id: number;
  type: 'grant' | 'attend' | 'grade' | 'view' | 'report' | 'revoke' | 'search';
  icon: string;
  message: string;
  sub: string;
  time: string;
}

export interface Permission {
  id: string;
  label: string;
  sub: string;
  status: 'on' | 'restricted' | 'off';
}

export interface QuickAccessItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  colorVar: string;
  iconColorVar: string;
}

export interface AssistantDashboardData {
  teacher: DashboardTeacher;
  kpis: KpiTile[];
  activities: ActivityItem[];
  permissions: Permission[];
  quickAccess: QuickAccessItem[];
}
