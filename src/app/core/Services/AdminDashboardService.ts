import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ActivityApiDto,
  ActivityItemDto,
  AdminDashboardResponseDto,
  AdminStatsApiResponseDto,
  KpiDto,
  KpiId,
  RevenuePointDto,
  SectionCardDto,
} from '../Models/Admin/dashboardmodel';
import { environment } from '../../../environments/environment';

const ARABIC_DAY_NAMES = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const nf = () =>
  new Intl.NumberFormat(
    typeof window !== 'undefined' ? (localStorage.getItem('lang') ?? 'ar') : 'ar',
  );

function arabicDayName(iso: string): string {
  return ARABIC_DAY_NAMES[new Date(iso).getDay()];
}

function arabicPageDateLabel(iso: string): string {
  const date = new Date(iso);
  const day = arabicDayName(iso);
  const formatted = date.toLocaleDateString(
    localStorage.getItem('lang') === 'ar' ? 'ar-EG' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );
  return `إحصائيات المنصة الكاملة ليوم ${day} ${formatted}`;
}

function arabicRelativeTime(iso: string, now: Date): string {
  const diffMin = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));

  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${nf().format(diffMin)} د`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `منذ ${nf().format(diffHours)} س`;

  const diffDays = Math.round(diffHours / 24);
  return `منذ ${nf().format(diffDays)} يوم`;
}

const KPI_DELTA_CONTEXT: Record<KpiId, { changed: string; flat: string }> = {
  students: { changed: 'عن الشهر الماضي', flat: 'دون تغيير هذا الشهر' },
  revenue: { changed: 'عن الشهر الماضي', flat: 'دون تغيير عن الشهر الماضي' },
  'lessons-sold': { changed: 'عن الشهر الماضي', flat: 'دون تغيير عن الشهر الماضي' },
  uptime: { changed: 'آخر ٣٠ يوم', flat: 'آخر ٣٠ يوم' },
};

function buildDeltaLabel(id: KpiId, delta: number): string {
  const ctx = KPI_DELTA_CONTEXT[id];
  if (delta > 0) return `↑ ${nf().format(delta)}٪ ${ctx.changed}`;
  if (delta < 0) return `↓ ${nf().format(Math.abs(delta))}٪ ${ctx.changed}`;
  return ctx.flat;
}

const ACTIVITY_TITLES: Record<ActivityApiDto['type'], string> = {
  enroll: 'تسجيل جديد',
  payment: 'دفعة واردة',
  alert: 'تنبيه',
  teacher: 'نشاط معلم',
  system: 'نشاط النظام',
};

const ENROLL_METHOD_LABELS: Record<string, string> = {
  TeacherGrant: 'منحة من المعلم',
  RedeemCode: 'كود تفعيل',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  Online: 'دفع أونلاين',
  PayPal: 'PayPal',
  Fawry: 'فوري',
  Vodafone: 'فودافون كاش',
};

function arabicSubtitle(dto: ActivityApiDto): string {
  if (dto.type === 'enroll') {
    return ENROLL_METHOD_LABELS[dto.metaInfo] ?? dto.metaInfo;
  }

  if (dto.type === 'payment') {
    const [method, txn] = dto.metaInfo.split(' - ');
    const methodLabel = PAYMENT_METHOD_LABELS[method] ?? method;
    return txn ? `${methodLabel} · ${txn}` : methodLabel;
  }

  return dto.metaInfo;
}

const CURRENCY_LABELS: Record<string, string> = {
  EGP: 'جنيه',
  USD: 'دولار',
  SAR: 'ريال سعودي',
};

function formatPaymentDetails(details: string): string {
  const match = details.match(/^([\d,.]+)\s*([A-Za-z]+)$/);
  if (!match) return details;

  const [, rawAmount, currencyCode] = match;
  const amount = Number(rawAmount.replace(/,/g, ''));
  const currencyLabel = CURRENCY_LABELS[currencyCode] ?? currencyCode;

  return `${nf().format(amount)} ${currencyLabel}`;
}

function mapActivity(dto: ActivityApiDto, now: Date): ActivityItemDto {
  const details = dto.type === 'payment' ? formatPaymentDetails(dto.details) : dto.details;

  return {
    id: dto.id,
    type: dto.type,
    message: `${ACTIVITY_TITLES[dto.type] ?? dto.type} — ${details}`,
    subtitle: arabicSubtitle(dto),
    time: arabicRelativeTime(dto.activityDate, now),
  };
}

@Service()
export class DashboardService {
  private readonly http = inject(HttpClient);

  private readonly statsUrl = `${environment.apiUrl}/Admin/stats`;
  private readonly activitiesUrl = `${environment.apiUrl}/Admin/activities`;

  private getStats(): Observable<AdminStatsApiResponseDto> {
    return this.http.get<AdminStatsApiResponseDto>(this.statsUrl);
  }

  private getActivities(): Observable<ActivityApiDto[]> {
    return this.http.get<ActivityApiDto[]>(this.activitiesUrl);
  }

  getDashboard(): Observable<AdminDashboardResponseDto> {
    return forkJoin({
      stats: this.getStats(),
      activities: this.getActivities(),
    }).pipe(
      map(({ stats, activities }) => {
        const now = new Date(stats.currentDateTime);

        const kpis: KpiDto[] = stats.kpis.map((k) => ({
          id: k.id,
          value: k.value,
          deltaLabel: buildDeltaLabel(k.id, k.delta),
        }));

        const revenueWeek: RevenuePointDto[] = stats.revenueWeek.map((p) => ({
          day: arabicDayName(p.date),
          amount: p.amount,
          isToday: p.isToday,
        }));

        const activity: ActivityItemDto[] = [...activities]
          .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime())
          .map((a) => mapActivity(a, now));

        // /Admin/stats no longer returns section-card counts. Keeping the
        // field (empty) so templates that iterate over it don't break;
        // wire this up once a real endpoint/field exists.
        const sectionCards: SectionCardDto[] = [];

        return {
          pageDateLabel: arabicPageDateLabel(stats.currentDateTime),
          kpis,
          revenueWeek,
          weeklyTotal: stats.weeklyTotal,
          activity,
          sectionCards,
        };
      }),
    );
  }
}
