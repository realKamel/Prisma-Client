import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffSideBar } from '../../Components/staff-side-bar/staff-side-bar';
import { Cursor } from "../../Components/cursor/cursor";

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, StaffSideBar, Cursor],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  mobileMenuOpen = signal<boolean>(false);
}
