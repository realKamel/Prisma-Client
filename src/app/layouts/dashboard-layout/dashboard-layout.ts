import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffSideBar } from '../../Components/staff-side-bar/staff-side-bar';
import { Cursor } from "../../Components/cursor/cursor";
import { Toast } from "../../Components/toast/toast";

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, StaffSideBar, Cursor, Toast],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {
  mobileMenuOpen = signal<boolean>(false);
}
