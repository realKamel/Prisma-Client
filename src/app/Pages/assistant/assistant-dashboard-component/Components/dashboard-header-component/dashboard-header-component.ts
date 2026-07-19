import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-header',
  imports: [],
  templateUrl: './dashboard-header-component.html',
})
export class DashboardHeaderComponent {
  readonly teacherName = input<string>();
  readonly supervisorName = input<string>();
}
