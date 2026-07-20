import { Component, Input } from '@angular/core';
import { LogMeta } from '../../../../../core/Models/Assistant/log.model';
import { CountUpDirective } from '../shared/directives/count-up.directive';

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

  @Input() set meta(value: LogMeta | null) {
    this.tiles = value
      ? [
          {
            label: 'إجمالي الإجراءات',
            value: value.totalThisMonth,
            sub: 'هذا الشهر',
            valueColorClass: 'text-[var(--ink)]',
            accentBorderClass: 'border-t-[var(--purple)]',
          },
          {
            label: 'دروس ممنوحة',
            value: value.granted,
            sub: 'إجراءات منح',
            valueColorClass: 'text-[var(--ink)]',
            accentBorderClass: 'border-t-[var(--mint)]',
          },
          {
            label: 'دروس ملغاة',
            value: value.revoked,
            sub: 'إجراءات إلغاء',
            valueColorClass: 'text-[var(--ink)]',
            accentBorderClass: 'border-t-[var(--coral)]',
          },
          {
            label: 'معدل النجاح',
            value: value.successRate,
            sub: 'إجراءات ناجحة',
            valueColorClass: 'text-[var(--ink)]',
            accentBorderClass: 'border-t-[var(--star)]',
          },
        ]
      : [];
  }
}
