import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffSideBar } from '../../features/common/components/staff-side-bar/staff-side-bar';
import { Toast } from '../../features/common/components/toast/toast';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, StaffSideBar, Toast],
  templateUrl: './dashboard-layout.html',
  host: {
    '[attr.data-route]': '"dashboard"',
  },
})
export class DashboardLayout {
  protected readonly mobileMenuOpen = signal<boolean>(false);
}
