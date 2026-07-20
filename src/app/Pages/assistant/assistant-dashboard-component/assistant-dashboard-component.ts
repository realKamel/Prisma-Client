import { Component, OnInit, inject, signal } from '@angular/core';

import { AssistantDashboardData } from '../../../core/Models/Assistant/assistant-dashboard.model';
import { AssistantDashboardService } from '../../../core/Services/assistant-dashboard.service';
import { ActivityFeedComponent } from './Components/activity-feed-component/activity-feed-component';
import { DashboardHeaderComponent } from './Components/dashboard-header-component/dashboard-header-component';
import { KpiStripComponent } from './Components/kpi-strip-component/kpi-strip-component';
import { PermissionsCardComponent } from './Components/permissions-card-component/permissions-card-component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapWifiOff } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-assistant-dashboard',
  imports: [
    DashboardHeaderComponent,
    KpiStripComponent,
    ActivityFeedComponent,
    PermissionsCardComponent,
    NgIcon,
  ],
  templateUrl: './assistant-dashboard-component.html',
  viewProviders: [
    provideIcons({
      bootstrapWifiOff,
    }),
  ],
})
export class AssistantDashboardComponent implements OnInit {
  private dashboardService = inject(AssistantDashboardService);

  data = signal<AssistantDashboardData | null>(null);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
