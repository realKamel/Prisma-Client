import { Component, computed, input } from '@angular/core';
import { ActivityLogStats } from '../../../../../core/Models/Admin/activity-log.model';
import { CountUpDirective } from '../../count-up.directive';

interface KpiTile {
  label: string;
  value: number;
  sub: string;
  valueColorClass: string;
  accentBorderClass: string;
}

@Component({
  selector: 'app-kpi-strip',

  imports: [CountUpDirective],
  templateUrl: './kpi-strip.component.html',
})
export class KpiStripComponent {
  // 1. Replaced the skipped setter input with a modern optional input signal
  readonly stats = input<ActivityLogStats | null>(null);

  // 2. Transformed 'tiles' into a declarative computed signal
  readonly tiles = computed<KpiTile[]>(() => {
    const value = this.stats();

    return value
      ? [
          {
            label: 'إجمالي الأحداث',
            value: value.totalEvents,
            sub: 'آخر ٧ أيام',
            valueColorClass: 'text-[var(--ink)]',
            accentBorderClass: 'border-t-[var(--purple)]',
          },
          {
            label: 'أحداث اليوم',
            value: value.todayEvents,
            sub: 'منذ منتصف الليل',
            valueColorClass: 'text-[var(--ink)]',
            accentBorderClass: 'border-t-[var(--mint)]',
          },
          {
            label: 'مستخدمون نشطون',
            value: value.activeUsers,
            sub: 'هذا الأسبوع',
            valueColorClass: 'text-[var(--ink)]',
            accentBorderClass: 'border-t-[var(--star)]',
          },
          {
            label: 'تنبيهات',
            value: value.alerts,
            sub: 'تحذيرات وأخطاء',
            valueColorClass: 'text-[var(--ink)]',
            accentBorderClass: 'border-t-[var(--coral)]',
          },
        ]
      : [];
  });
}
