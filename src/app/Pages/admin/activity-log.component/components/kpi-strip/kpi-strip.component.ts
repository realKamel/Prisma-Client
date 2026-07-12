import { Component, Input } from '@angular/core';
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
  standalone: true,
  imports: [CountUpDirective],
  templateUrl: './kpi-strip.component.html',
})
export class KpiStripComponent {
  tiles: KpiTile[] = [];

  @Input() set stats(value: ActivityLogStats | null) {
    this.tiles = value
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
  }
}
