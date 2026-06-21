import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffSideBar } from '../../Components/staff-side-bar/staff-side-bar';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, StaffSideBar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  mobileMenuOpen = signal<boolean>(false);
}
