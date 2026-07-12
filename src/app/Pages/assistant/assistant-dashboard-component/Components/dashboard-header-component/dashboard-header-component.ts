import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-header-component.html',
})
export class DashboardHeaderComponent {
  @Input() teacherName = '';
  @Input() supervisorName = '';
}