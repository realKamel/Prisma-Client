import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistantDashboardData } from '../../../core/Models/Assistant/assistant-dashboard.model';
import { AssistantDashboardService } from '../../../core/Services/assistant-dashboard.service';
import { ActivityFeedComponent } from './Components/activity-feed-component/activity-feed-component';
import { DashboardHeaderComponent } from './Components/dashboard-header-component/dashboard-header-component';
import { KpiStripComponent } from './Components/kpi-strip-component/kpi-strip-component';
import { PermissionsCardComponent } from './Components/permissions-card-component/permissions-card-component';
import { QuickAccessComponent } from './Components/quick-access-component/quick-access-component';


@Component({
  selector: 'app-assistant-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderComponent,
    KpiStripComponent,
    ActivityFeedComponent,
    PermissionsCardComponent,
    QuickAccessComponent,
  ],
  templateUrl: './assistant-dashboard-component.html',
})
export class AssistantDashboardComponent implements OnInit {
  private dashboardService = inject(AssistantDashboardService);

  data: AssistantDashboardData | null = null;
  loading = true;
  error   = false;

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (d) => {
        this.data    = d;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = true;
        this.loading = false;
      },
    });}
  private cdr = inject(ChangeDetectorRef);
}