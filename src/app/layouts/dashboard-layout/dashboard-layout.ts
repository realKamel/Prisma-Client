import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffSideBar } from '../../Components/staff-side-bar/staff-side-bar';
import { Toast } from '../../Components/toast/toast';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, StaffSideBar, Toast],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {
  protected readonly mobileMenuOpen = signal<boolean>(false);
}
