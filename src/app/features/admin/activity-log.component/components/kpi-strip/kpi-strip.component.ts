import { Component, computed, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { CountUpDirective } from '../../../../../shared/directives/count-up/count-up.directive';
import { ActivityLogStats } from '../../../models/activity-log.model';
import { KpiTile } from '../../../models/activity-ui.model';

@Component({
  selector: 'app-kpi-strip',
  imports: [CountUpDirective, NgmMotionDirective],
  templateUrl: './kpi-strip.component.html',
})
export class KpiStripComponent {
  // 1. Replaced the skipped setter input with a modern optional input signal
  public readonly stats = input<ActivityLogStats | null>(null);

  // 2. Transformed 'tiles' into a declarative computed signal
  protected readonly tiles = computed<KpiTile[]>(() => {
    const value = this.stats();

    return value
      ? [
          {
            label: 'إجمالي الأحداث',
            value: value.totalEvents,
            sub: 'آخر ٧ أيام',
            valueColorClass: 'text-ink',
            accentBorderClass: 'border-t-primary',
          },
          {
            label: 'أحداث اليوم',
            value: value.todayEvents,
            sub: 'منذ منتصف الليل',
            valueColorClass: 'text-ink',
            accentBorderClass: 'border-t-mint',
          },
          {
            label: 'مستخدمون نشطون',
            value: value.activeUsers,
            sub: 'هذا الأسبوع',
            valueColorClass: 'text-ink',
            accentBorderClass: 'border-t-star',
          },
          {
            label: 'تنبيهات',
            value: value.alerts,
            sub: 'تحذيرات وأخطاء',
            valueColorClass: 'text-ink',
            accentBorderClass: 'border-t-coral',
          },
        ]
      : [];
  });
}
