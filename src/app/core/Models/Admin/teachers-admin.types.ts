export type TeacherStatus = 'active' | 'suspended';

export interface Teacher {
  id: string; 
  name: string;
  phone: string;
  subject: string;
  students: number;
  revenue: number;
  status: TeacherStatus;
}

export interface TeacherFilters {
  query: string;
  status: TeacherStatus | 'all';
}

export interface KpiTile {
  label: string;
  value: number;
  unit?: string;
  delta: string;
  deltaUp: boolean;
  colorClass: string;
}


export interface TeacherStats {
  totalTeachers: number;
  newTeachersThisMonth: number;
  activeTeachers: number;
  monthRevenue: number;
  revenueChangePercent: number;
  totalStudents: number; // 🌟 الحقل الجديد
}

export interface ToastState {
  message: string;
  warn: boolean;
}

export const STATUS_LABELS: Record<TeacherStatus, string> = {
  active: 'نشط',
  suspended: 'موقوف',
};