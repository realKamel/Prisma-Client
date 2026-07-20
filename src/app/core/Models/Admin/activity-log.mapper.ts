import {
  ActivityEvent,
  ActivityLogResponse,
  ActorRole,
  EventActionType,
  EventStatus,
  ApiActivityLogResponseDto,
  ApiActivityEventDto,
} from './activity-log.model'; 


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

type SentenceBuilder = (detail: string | null | undefined) => string;

function withDetail(base: string, withDetailText: (d: string) => string): SentenceBuilder {
  return (detail) => (detail ? withDetailText(detail) : base);
}

const ACTION_SENTENCE_AR: Record<string, Partial<Record<EventActionType, SentenceBuilder>>> = {
  academicyear: {
    insert: withDetail('تم إنشاء سنة دراسية جديدة', (d) => `تم إنشاء سنة دراسية جديدة "${d}"`),
    update: withDetail('تم تعديل بيانات سنة دراسية', (d) => `تم تعديل بيانات السنة الدراسية "${d}"`),
    delete: withDetail('تم حذف سنة دراسية', (d) => `تم حذف السنة الدراسية "${d}"`),
    select: withDetail('تم الاطلاع على بيانات سنة دراسية', (d) => `تم الاطلاع على بيانات السنة الدراسية "${d}"`),
  },
  academicyearlesson: {
    insert: withDetail('تمت إضافة درس إلى السنة الدراسية', (d) => `تمت إضافة درس "${d}" إلى السنة الدراسية`),
    update: withDetail('تم تعديل درس ضمن السنة الدراسية', (d) => `تم تعديل درس "${d}" ضمن السنة الدراسية`),
    delete: withDetail('تم حذف درس من السنة الدراسية', (d) => `تم حذف درس "${d}" من السنة الدراسية`),
    select: withDetail('تم الاطلاع على دروس السنة الدراسية', (d) => `تم الاطلاع على درس "${d}" بالسنة الدراسية`),
  },
  academicyearteacher: {
    insert: withDetail('تم تعيين معلم على السنة الدراسية', (d) => `تم تعيين المعلم "${d}" على السنة الدراسية`),
    update: withDetail('تم تعديل بيانات معلم السنة الدراسية', (d) => `تم تعديل بيانات المعلم "${d}"`),
    delete: withDetail('تمت إزالة معلم من السنة الدراسية', (d) => `تمت إزالة المعلم "${d}" من السنة الدراسية`),
    select: withDetail('تم الاطلاع على معلمي السنة الدراسية', (d) => `تم الاطلاع على بيانات المعلم "${d}"`),
  },
  assignment: {
    insert: withDetail('تم إنشاء واجب جديد', (d) => `تم إنشاء واجب جديد "${d}"`),
    update: withDetail('تم تعديل بيانات واجب', (d) => `تم تعديل بيانات واجب "${d}"`),
    delete: withDetail('تم حذف واجب', (d) => `تم حذف واجب "${d}"`),
    select: withDetail('تم الاطلاع على واجب', (d) => `تم الاطلاع على واجب "${d}"`),
  },
  assignmentsubmission: {
    insert: withDetail('تم تسليم واجب جديد', (d) => `تم تسليم الواجب "${d}"`),
    update: withDetail('تم تعديل تسليم واجب', (d) => `تم تعديل تسليم الواجب "${d}"`),
    delete: withDetail('تم حذف تسليم واجب', (d) => `تم حذف تسليم الواجب "${d}"`),
    select: withDetail('تم الاطلاع على تسليم واجب', (d) => `تم الاطلاع على تسليم الواجب "${d}"`),
  },
  attemptanswer: {
    insert: () => 'تم تسجيل إجابة على سؤال كويز',
    update: () => 'تم تعديل إجابة سؤال كويز',
    delete: () => 'تم حذف إجابة سؤال كويز',
    select: () => 'تم الاطلاع على إجابة سؤال كويز',
  },
  aspnetuserroles: {
    insert: () => 'تم إسناد دور جديد لمستخدم',
    update: () => 'تم تعديل دور مستخدم',
    delete: () => 'تم إلغاء دور مستخدم',
    select: () => 'تم الاطلاع على أدوار مستخدم',
  },
  choice: {
    insert: () => 'تمت إضافة خيار جديد لسؤال',
    update: () => 'تم تعديل خيار سؤال',
    delete: () => 'تم حذف خيار سؤال',
    select: () => 'تم الاطلاع على خيار سؤال',
  },
  enrollment: {
    insert: () => 'تم تسجيل طالب جديد',
    update: () => 'تم تعديل بيانات تسجيل طالب',
    delete: () => 'تم إلغاء تسجيل طالب',
    select: () => 'تم الاطلاع على بيانات تسجيل طالب',
  },
  lesson: {
    insert: withDetail('تمت إضافة درس جديد', (d) => `تم نشر درس "${d}"`),
    update: withDetail('تم تعديل بيانات درس', (d) => `تم تعديل بيانات درس "${d}"`),
    delete: withDetail('تم حذف درس', (d) => `تم حذف درس "${d}"`),
    select: withDetail('تم الاطلاع على درس', (d) => `تم الاطلاع على درس "${d}"`),
  },
  lessonmaterial: {
    insert: withDetail('تم رفع مادة تعليمية جديدة', (d) => `تم رفع مادة تعليمية جديدة "${d}"`),
    update: withDetail('تم تعديل مادة تعليمية', (d) => `تم تعديل مادة تعليمية "${d}"`),
    delete: withDetail('تم حذف مادة تعليمية', (d) => `تم حذف مادة تعليمية "${d}"`),
    select: withDetail('تم الاطلاع على مادة تعليمية', (d) => `تم الاطلاع على مادة تعليمية "${d}"`),
  },
  payment: {
    insert: withDetail('تم تسجيل دفعة جديدة', (d) => `تم استلام دفعة بقيمة ${d}`),
    update: withDetail('تم تعديل بيانات دفعة', (d) => `تم تعديل بيانات دفعة بقيمة ${d}`),
    delete: withDetail('تم حذف دفعة', (d) => `تم حذف دفعة بقيمة ${d}`),
    select: withDetail('تم الاطلاع على بيانات دفعة', (d) => `تم الاطلاع على دفعة بقيمة ${d}`),
  },
  question: {
    insert: withDetail('تمت إضافة سؤال جديد', (d) => `تمت إضافة سؤال جديد "${d}"`),
    update: withDetail('تم تعديل سؤال', (d) => `تم تعديل السؤال "${d}"`),
    delete: withDetail('تم حذف سؤال', (d) => `تم حذف السؤال "${d}"`),
    select: withDetail('تم الاطلاع على سؤال', (d) => `تم الاطلاع على السؤال "${d}"`),
  },
  questionlessonquiz: {
    insert: () => 'تم ربط سؤال بكويز الدرس',
    update: () => 'تم تعديل ربط سؤال بالكويز',
    delete: () => 'تمت إزالة سؤال من الكويز',
    select: () => 'تم الاطلاع على أسئلة الكويز',
  },
  quiz: {
    insert: withDetail('تم إنشاء كويز جديد', (d) => `تم إنشاء كويز جديد "${d}"`),
    update: withDetail('تم تعديل بيانات كويز', (d) => `تم تعديل بيانات كويز "${d}"`),
    delete: withDetail('تم حذف كويز', (d) => `تم حذف كويز "${d}"`),
    select: withDetail('تم الاطلاع على كويز', (d) => `تم الاطلاع على كويز "${d}"`),
  },
  quizattempt: {
    insert: () => 'تم بدء محاولة كويز جديدة',
    update: () => 'تم تحديث محاولة كويز',
    delete: () => 'تم حذف محاولة كويز',
    select: () => 'تم الاطلاع على محاولة كويز',
  },
  redeemcode: {
    insert: withDetail('تم إنشاء كود استرداد جديد', (d) => `تم إنشاء كود استرداد جديد "${d}"`),
    update: withDetail('تم تعديل كود استرداد', (d) => `تم تعديل كود الاسترداد "${d}"`),
    delete: withDetail('تم حذف كود استرداد', (d) => `تم حذف كود الاسترداد "${d}"`),
    select: withDetail('تم الاطلاع على كود استرداد', (d) => `تم الاطلاع على كود الاسترداد "${d}"`),
  },
  report: {
    insert: withDetail('تم إنشاء تقرير جديد', (d) => `تم إنشاء تقرير جديد "${d}"`),
    update: withDetail('تم تعديل تقرير', (d) => `تم تعديل تقرير "${d}"`),
    delete: withDetail('تم حذف تقرير', (d) => `تم حذف تقرير "${d}"`),
    select: withDetail('تم الاطلاع على تقرير', (d) => `تم الاطلاع على تقرير "${d}"`),
  },
  section: {
    insert: withDetail('تمت إضافة قسم جديد', (d) => `تمت إضافة قسم جديد "${d}"`),
    update: withDetail('تم تعديل بيانات قسم', (d) => `تم تعديل بيانات قسم "${d}"`),
    delete: withDetail('تم حذف قسم', (d) => `تم حذف قسم "${d}"`),
    select: withDetail('تم الاطلاع على قسم', (d) => `تم الاطلاع على قسم "${d}"`),
  },
  sectionprogress: {
    insert: () => 'تم تسجيل تقدم جديد في قسم',
    update: () => 'تم تحديث تقدم قسم',
    delete: () => 'تم حذف تقدم قسم',
    select: () => 'تم الاطلاع على تقدم قسم',
  },
  user: {
    insert: withDetail('تم إنشاء حساب مستخدم جديد', (d) => `تم إنشاء حساب المستخدم "${d}"`),
    update: withDetail('تم تعديل بيانات مستخدم', (d) => `تم تعديل بيانات المستخدم "${d}"`),
    delete: withDetail('تم حذف حساب مستخدم', (d) => `تم حذف حساب المستخدم "${d}"`),
    select: withDetail('تم الاطلاع على بيانات مستخدم', (d) => `تم الاطلاع على بيانات المستخدم "${d}"`),
  },
  users: {
    insert: withDetail('تم إنشاء حساب مستخدم جديد', (d) => `تم إنشاء حساب المستخدم "${d}"`),
    update: withDetail('تم تعديل بيانات مستخدم', (d) => `تم تعديل بيانات المستخدم "${d}"`),
    delete: withDetail('تم حذف حساب مستخدم', (d) => `تم حذف حساب المستخدم "${d}"`),
    select: withDetail('تم الاطلاع على بيانات مستخدم', (d) => `تم الاطلاع على بيانات المستخدم "${d}"`),
  },
};

const ROLE_SET = new Set<ActorRole>(['teacher', 'assistant', 'student', 'admin', 'system']);


export function mapActivityLogResponse(api: ApiActivityLogResponseDto): ActivityLogResponse {
  return {
    stats: api.stats
      ? {
          totalEvents: api.stats.totalEvents,
          todayEvents: api.stats.todayEvents,
          activeUsers: api.stats.activeUsers,
          alerts: api.stats.alerts,
        }
      : null,
    events: api.events.map(mapEvent),
    hasMore: api.hasMore,
  };
}

function mapEvent(e: ApiActivityEventDto): ActivityEvent {
  const actionType = normalizeActionType(e.action);
  return {
    time: formatArabicTime(e.createdAt),
    user: e.user,
    role: normalizeRole(e.role),
    action: resolveActionSentence(e.tableName, actionType, e.action, e.detail),
    subtitle: resolveActionSubtitle(e.tableName, e.entityId),
    actionType,
    status: resolveStatus(e.action),
  };
}

function normalizeRole(role: string): ActorRole {
  const r = (role ?? '').toLowerCase() as ActorRole;
  return ROLE_SET.has(r) ? r : 'system';
}


function resolveActionSentence(
  tableName: string,
  actionType: EventActionType,
  rawAction: string,
  detail?: string | null,
): string {
  const t = (tableName ?? '').toLowerCase();
  const builder = ACTION_SENTENCE_AR[t]?.[actionType];
  if (builder) return builder(detail);

  return `تم ${ACTION_AR[actionType] ?? rawAction} على ${TABLE_AR[t] ?? tableName}`;
}

function resolveActionSubtitle(tableName: string, entityId: string): string {
  const t = (tableName ?? '').toLowerCase();
  const label = TABLE_AR[t] ?? tableName;
  return entityId ? `${label} · #${entityId}` : label;
}

const ACTION_TYPE_SET = new Set<EventActionType>(['insert', 'update', 'delete', 'select']);

function normalizeActionType(action: string): EventActionType {
  const a = (action ?? '').toLowerCase();
  const normalized = a === 'create' ? 'insert' : a;
  return ACTION_TYPE_SET.has(normalized as EventActionType) ? (normalized as EventActionType) : 'select';
}

function resolveStatus(action: string): EventStatus {
  const a = (action ?? '').toLowerCase();
  if (a.includes('delete') || a.includes('revoke')) return 'error';
  return 'ok';
}


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