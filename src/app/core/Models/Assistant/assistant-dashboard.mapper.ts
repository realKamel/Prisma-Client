import {
  AssistantDashboardData,
  ActivityItem,
  KpiTile,
  Permission,
} from './assistant-dashboard.model';

const nf = () =>
  new Intl.NumberFormat(
    typeof window !== 'undefined' ? (localStorage.getItem('lang') ?? 'ar') : 'ar',
  );

// ── Raw API response shape ─────────────────────────────────────

interface ApiKpiTile {
  id: string;
  value: number;
  delta: number;
  trend: 'up' | 'down';
  variant: 'purple' | 'mint' | 'star' | 'coral';
}

interface ApiActivityItem {
  id: number;
  action: string;
  tableName: string;
  createdAt: string;
}

interface ApiPermission {
  id: string;
  status: 'on' | 'off';
}

export interface ApiAssistantDashboardResponse {
  teacher: { name: string; supervisorName: string };
  kpis: ApiKpiTile[];
  activities: ApiActivityItem[];
  permissions: ApiPermission[];
}

// ── KPI metadata (label + unit + delta formatter) ──────────────

const KPI_META: Record<
  string,
  {
    label: string;
    unit: string;
    formatDelta: (delta: number, trend: 'up' | 'down') => string;
  }
> = {
  students: {
    label: 'طلاب نشطين',
    unit: 'طالب',
    formatDelta: (d) =>
      d > 0
        ? `+${nf().format(d)} من الأسبوع الماضي`
        : `${nf().format(Math.abs(d))} من الأسبوع الماضي`,
  },
  quizzes: {
    label: 'كويزات هذا الأسبوع',
    unit: 'كويز',
    formatDelta: (d) => {
      const pct = Math.round(Math.abs(d) * 100);
      return d >= 0 ? `معدل نجاح ${nf().format(pct)}٪` : `انخفاض ${nf().format(pct)}٪ في النجاح`;
    },
  },
  assignments: {
    label: 'واجبات للتصحيح',
    unit: 'واجب',
    formatDelta: () => 'تحتاج متابعة',
  },
  lessons: {
    label: 'إجمالي الدروس',
    unit: 'درس',
    formatDelta: (d) => (d > 0 ? `+${nf().format(d)} هذا الأسبوع` : 'لا دروس جديدة'),
  },
};

// ── Permission metadata (label + sub) ─────────────────────────

const PERMISSION_META: Record<string, { label: string; sub: string }> = {
  students: { label: 'إدارة الطلاب', sub: 'إضافة · تعديل · حذف' },
  content: { label: 'إدارة المحتوى', sub: 'إضافة · تعديل · حذف' },
  reports: { label: 'إرسال التقارير', sub: 'للطلاب وأولياء الأمور' },
  grading: { label: 'التصحيح والتقييم', sub: 'كويزات وواجبات وامتحانات' },
};

// ── Activity metadata (icon + message builder) ─────────────────

const ACTIVITY_META: Record<string, { icon: string; message: string; sub: string }> = {
  grant: { icon: 'bootstrapSendFill', message: 'منح درس لطالب', sub: '' },
  revoke: { icon: 'bootstrapXCircleFill', message: 'إلغاء منح درس', sub: '' },
  grade: { icon: 'bootstrapFileEarmarkCheckFill', message: 'تصحيح واجب أو كويز', sub: '' },
  view: { icon: 'bootstrapEyeFill', message: 'عرض ملف طالب', sub: '' },
  report: { icon: 'bootstrapEnvelopeFill', message: 'إرسال تقرير', sub: '' },
  attend: { icon: 'bootstrapPersonCheckFill', message: 'تسجيل حضور', sub: '' },
  search: { icon: 'bootstrapSearch', message: 'بحث في المنصة', sub: '' },
};

// ── Quick access — fully static ────────────────────────────────

const QUICK_ACCESS = [
  {
    id: 'students',
    label: 'قائمة الطلاب',
    icon: 'bootstrapPeopleFill',
    route: '/dashboard/students',
    colorVar: '--accent-rgb',
    iconColorVar: '--purple-lt',
  },
  {
    id: 'grant',
    label: 'منح درس لطالب',
    icon: 'bootstrapSendFill',
    route: '/assistant/students/',
    colorVar: '78,203,141',
    iconColorVar: '--mint',
  },
  {
    id: 'content',
    label: 'إدارة المحتوى',
    icon: 'bootstrapLayersFill',
    route: '/assistant/content',
    colorVar: '247,201,72',
    iconColorVar: '--star',
  },
  {
    id: 'log',
    label: 'سجل أنشطتي',
    icon: 'bootstrapJournalText',
    route: '/assistant/log',
    colorVar: '240,106,106',
    iconColorVar: '--coral',
  },
];

// ── Mapper ─────────────────────────────────────────────────────

export function mapDashboardResponse(api: ApiAssistantDashboardResponse): AssistantDashboardData {
  return {
    teacher: api.teacher,

    kpis: api.kpis.map((k): KpiTile => {
      const meta = KPI_META[k.id];
      return {
        id: k.id,
        value: k.value,
        trend: k.trend,
        variant: k.variant,
        label: meta?.label ?? k.id,
        unit: meta?.unit ?? '',
        delta: meta?.formatDelta(k.delta, k.trend) ?? String(k.delta),
      };
    }),

    activities: api.activities.map((a): ActivityItem => {
      const { icon, message } = resolveActivity(a.action, a.tableName);
      return {
        id: a.id,
        type: 'view',
        icon,
        message,
        sub: '',
        time: formatRelativeTime(a.createdAt),
      };
    }),

    permissions: api.permissions.map((p): Permission => {
      const meta = PERMISSION_META[p.id];
      return {
        id: p.id,
        status: p.status,
        label: meta?.label ?? p.id,
        sub: meta?.sub ?? '',
      };
    }),

    quickAccess: QUICK_ACCESS,
  };
}

const TABLE_AR: Record<string, string> = {
  academicyear: 'السنة الدراسية',
  academicyearlesson: 'دروس السنة الدراسية',
  academicyearteacher: 'معلمي السنة الدراسية',
  assignment: 'الواجبات',
  assignmentsubmission: 'تسليمات الواجبات',
  attemptanswer: 'إجابات الكويز',
  choice: 'الخيارات',
  enrollment: 'التسجيلات',
  lesson: 'الدروس',
  lessonmaterial: 'مواد الدرس',
  payment: 'المدفوعات',
  question: 'الأسئلة',
  questionlessonquiz: 'أسئلة الكويز',
  quiz: 'الكويزات',
  quizattempt: 'محاولات الكويز',
  redeemcode: 'أكواد الاسترداد',
  report: 'التقارير',
  section: 'الأقسام',
  sectionprogress: 'تقدم الأقسام',
  users: 'المستخدمين',
  enrollments: 'التسجيلات',
  lessons: 'الدروس',
  payments: 'المدفوعات',
  assignments: 'الواجبات',
  assignmentsubmissions: 'تسليمات الواجبات',
  quizattempts: 'محاولات الكويز',
  sections: 'الأقسام',
  questions: 'الأسئلة',
  reports: 'التقارير',
};
const ACTION_AR: Record<string, string> = {
  insert: 'إضافة',
  create: 'إضافة',
  update: 'تعديل',
  delete: 'حذف',
  select: 'اطلاع',
};

const ACTION_ICON: Record<string, string> = {
  insert: 'bootstrapPlusCircleFill',
  create: 'bootstrapPlusCircleFill',
  update: 'bootstrapPencilFill',
  delete: 'bootstrapTrashFill',
  select: 'bootstrapEyeFill',
};
// ── Helpers ────────────────────────────────────────────────────

function resolveActivity(action: string, tableName: string): { icon: string; message: string } {
  const a = action.toLowerCase();
  const t = tableName.toLowerCase();
  return {
    icon: ACTION_ICON[a] ?? 'bootstrapActivity',
    message: `تم ${ACTION_AR[a] ?? action} على ${TABLE_AR[t] ?? tableName}`,
  };
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return 'الآن';
  if (mins < 60) return `${nf().format(mins)} د`;
  if (hours < 24) return `${nf().format(hours)} س`;
  if (days === 1) return 'أمس';
  return `${nf().format(days)} أيام`;
}
