import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { KpiId, KpiDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { CountUpDirective } from '../count-up.directive (1)';
import { ArNumberPipe } from '../ar-number.pipe';
import { DecimalPipe } from '@angular/common';

interface KpiStaticConfig {
  label: string;
  unit?: string;
  animated: boolean;
  borderClass: string;
  deltaClass: string;
}

const KPI_STATIC_CONFIG: Record<KpiId, KpiStaticConfig> = {
  students: {
    label: 'إجمالي الطلاب',
    animated: true,
    borderClass: 'border-t-2 border-t-[var(--purple)]',
    deltaClass: 'text-[var(--purple-lt)]',
  },
  revenue: {
    label: 'الإيرادات هذا الشهر',
    unit: 'جنيه',
    animated: true,
    borderClass: 'border-t-2 border-t-[var(--mint)]',
    deltaClass: 'text-[var(--mint)]',
  },
  'lessons-sold': {
    label: 'الدروس المباعة',
    animated: true,
    borderClass: 'border-t-2 border-t-[var(--star)]',
    deltaClass: 'text-[var(--star)]',
  },
  uptime: {
    label: 'وقت التشغيل',
    unit: '٪',
    animated: false,
    borderClass: 'border-t-2 border-t-[var(--coral)]',
    deltaClass: 'text-[var(--coral)]',
  },
};

@Component({
  selector: 'app-kpi-tile',
  imports: [CountUpDirective, DecimalPipe],
  templateUrl: './kpi-tile.html',
})
export class KpiTile {
  readonly kpi = input.required<KpiDto>();

  private readonly config = computed(() => KPI_STATIC_CONFIG[this.kpi().id]);

  label(): string {
    return this.config().label;
  }
  unit(): string | undefined {
    return this.config().unit;
  }
  animated(): boolean {
    return this.config().animated;
  }
  borderGlowClass(): string {
    return this.config().borderClass;
  }
  deltaClass(): string {
    return this.config().deltaClass;
  }
}
