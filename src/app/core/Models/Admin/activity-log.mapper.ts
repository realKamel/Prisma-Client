// activity-log.mapper.ts

import {
  ActivityEvent,
  ActivityLogResponse,
  ActorRole,
  EventStatus,
  ApiActivityLogResponseDto,
  ApiActivityEventDto,
} from './activity-log.model'; // TODO: عدّلي المسار لو مختلف

// ── جداول الترجمة العربية ───────────────────────────────────────

const TABLE_AR: Record<string, string> = {
  academicyear:          'السنة الدراسية',
  academicyearlesson:    'دروس السنة الدراسية',
  academicyearteacher:   'معلمي السنة الدراسية',
  assignment:            'الواجبات',
  assignmentsubmission:  'تسليمات الواجبات',
  attemptanswer:         'إجابات الكويز',
  aspnetuserroles:       'أدوار المستخدمين',
  choice:                'الخيارات',
  enrollment:            'التسجيلات',
  lesson:                'الدروس',
  lessonmaterial:        'مواد الدرس',
  payment:               'المدفوعات',
  question:              'الأسئلة',
  questionlessonquiz:    'أسئلة الكويز',
  quiz:                  'الكويزات',
  quizattempt:           'محاولات الكويز',
  redeemcode:            'أكواد الاسترداد',
  report:                'التقارير',
  section:               'الأقسام',
  sectionprogress:       'تقدم الأقسام',
  user:                  'المستخدمين',
  users:                 'المستخدمين',
};

const ACTION_AR: Record<string, string> = {
  insert: 'إضافة',
  create: 'إضافة',
  update: 'تعديل',
  delete: 'حذف',
  select: 'اطلاع',
};

const ROLE_SET = new Set<ActorRole>(['teacher', 'assistant', 'student', 'admin', 'system']);

// ── Mapper ───────────────────────────────────────────────────────

export function mapActivityLogResponse(api: ApiActivityLogResponseDto): ActivityLogResponse {
  return {
    stats: {
      totalEvents: api.stats.totalEvents,
      todayEvents: api.stats.todayEvents,
      activeUsers: api.stats.activeUsers,
      alerts: api.stats.alerts,
    },
    events: api.events.map(mapEvent),
  };
}

function mapEvent(e: ApiActivityEventDto): ActivityEvent {
  return {
    time: formatArabicTime(e.createdAt),
    user: e.user,
    role: normalizeRole(e.role),
    action: resolveActionMessage(e.action, e.tableName),
    status: resolveStatus(e.action),
  };
}

function normalizeRole(role: string): ActorRole {
  const r = (role ?? '').toLowerCase() as ActorRole;
  return ROLE_SET.has(r) ? r : 'system';
}

function resolveActionMessage(action: string, tableName: string): string {
  const a = (action ?? '').toLowerCase();
  const t = (tableName ?? '').toLowerCase();
  return `تم ${ACTION_AR[a] ?? action} على ${TABLE_AR[t] ?? tableName}`;
}

function resolveStatus(action: string): EventStatus {
  const a = (action ?? '').toLowerCase();
  if (a.includes('delete') || a.includes('revoke')) return 'error';
  return 'ok';
}

// ── تنسيق الوقت بالعربي ────────────────────────────────────────

function toAr(n: number | string): string {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

function formatArabicTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timePart = `${toAr(hours)}:${toAr(minutes)}`;

  if (isSameDay(date, now)) return `اليوم، ${timePart}`;
  if (isSameDay(date, yesterday)) return `أمس، ${timePart}`;

  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 2) return 'قبل يومين';
  return `قبل ${toAr(diffDays)} أيام`;
}