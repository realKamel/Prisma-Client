import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  ActivityItemDto,
  KpiDto,
  RevenuePointDto,
  SectionCardDto,
} from '../../../core/Models/Admin/dashboardmodel';
import { PageHeaderComponent } from './components/page-header/page-header';
import { KpiStripComponent } from './components/kpi-strip/kpi-strip';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart';
import { ActivityFeed } from './components/activity-feed/activity-feed';
import { DashboardService } from '../../../core/Services/AdminDashboardService';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    PageHeaderComponent,
    KpiStripComponent,
    RevenueChartComponent,
    ActivityFeed,
    NgmMotionDirective,
  ],
  templateUrl: './dashboard-page.html',
})
export class DashboardPageComponent {
  private readonly dashboardService = inject(DashboardService);

  private readonly response = toSignal(this.dashboardService.getDashboard());

  protected readonly pageDateLabel = computed<string>(() => this.response()?.pageDateLabel ?? '');
  protected readonly kpis = computed<KpiDto[]>(() => this.response()?.kpis ?? []);
  protected readonly revenueWeek = computed<RevenuePointDto[]>(
    () => this.response()?.revenueWeek ?? [],
  );
  protected readonly weeklyTotal = computed<number>(() => this.response()?.weeklyTotal ?? 0);
  protected readonly activity = computed<ActivityItemDto[]>(() => this.response()?.activity ?? []);
  protected readonly sectionCards = computed<SectionCardDto[]>(
    () => this.response()?.sectionCards ?? [],
  );
}
