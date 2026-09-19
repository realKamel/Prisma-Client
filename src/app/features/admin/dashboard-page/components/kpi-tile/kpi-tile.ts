import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { KpiStaticConfig } from '../../../../../core/Models/Admin/activity-ui.model';
import { KpiDto, KpiId } from '../../../../../core/Models/Admin/dashboardmodel';
import { CountUpDirective } from '../count-up.directive (1)';

@Component({
  selector: 'app-kpi-tile',
  imports: [CountUpDirective, DecimalPipe, NgmMotionDirective, TranslatePipe],
  templateUrl: './kpi-tile.html',
})
export class KpiTileComponent {
  public readonly kpi = input.required<KpiDto>();
  private readonly KPI_STATIC_CONFIG: Record<KpiId, KpiStaticConfig> = {
    students: {
      label: 'ADMIN_DASHBOARD.KPI.STUDENTS',
      animated: true,
      borderClass: 'border-t-2 border-t-primary',
      deltaClass: 'text-primary-light',
    },
    revenue: {
      label: 'ADMIN_DASHBOARD.KPI.REVENUE_THIS_MONTH',
      unit: 'COMMON.CURRENCY_EGP',
      animated: true,
      borderClass: 'border-t-2 border-t-mint',
      deltaClass: 'text-mint',
    },
    'lessons-sold': {
      label: 'ADMIN_DASHBOARD.KPI.LESSONS_SOLD',
      animated: true,
      borderClass: 'border-t-2 border-t-star',
      deltaClass: 'text-star',
    },
    uptime: {
      label: 'ADMIN_DASHBOARD.KPI.UPTIME',
      unit: 'ADMIN_DASHBOARD.KPI.PERCENT',
      animated: false,
      borderClass: 'border-t-2 border-t-coral',
      deltaClass: 'text-ink',
    },
  };
  private readonly config = computed(() => this.KPI_STATIC_CONFIG[this.kpi().id]);

  /** Translation key for the KPI label. */
  protected labelKey(): string {
    return this.config().label;
  }
  /** Translation key for the KPI unit (optional). */
  protected unitKey(): string | undefined {
    return this.config().unit;
  }
  protected animated(): boolean {
    return this.config().animated;
  }
  protected borderGlowClass(): string {
    return this.config().borderClass;
  }
  protected deltaClass(): string {
    return this.config().deltaClass;
  }
}
