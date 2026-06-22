import { Component, inject, input, output, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/Services/theme'; // Adjust this path if necessary
import { AuthService } from '../../core/Services/auth';
import {
  LucideDynamicIcon,
  LucideLayoutDashboard,
  LucideBook,
  LucideUsers,
  LucideTrendingUp,
  LucideUserPlus,
  LucideSquarePen,
} from '@lucide/angular';
interface UserInfo {
  teacherInitial: string;
  teacherName: string;
  subject: string;
}

@Component({
  selector: 'app-staff-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideDynamicIcon],
  templateUrl: './staff-side-bar.html',
})
export class StaffSideBar {
  public readonly themeService = inject(ThemeService);
  public readonly auth = inject(AuthService);

  public readonly isMobileMenuOpen = input<boolean>(false);
  public readonly isDesktopExpanded = input<boolean>(true);
  public readonly toggleMobileMenu = output<void>();

  public readonly userInfo: WritableSignal<UserInfo> = signal<UserInfo>({
    teacherInitial: 'ف',
    teacherName: 'أ. فاطمة علي',
    subject: 'معلم فيزياء',
  });

  navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      route: '/dashboard',
      icon: LucideLayoutDashboard,
    },
    {
      id: 'lessons',
      label: 'الدروس المرفوعة',
      route: '/lessons',
      icon: LucideBook,
    },
    {
      id: 'students',
      label: 'قائمة الطلاب',
      route: '/students',
      icon: LucideUsers,
    },
    {
      id: 'myexams',
      label: 'التصحيح والتقييم',
      route: '/dashboard/myexams',
      icon: LucideSquarePen,
    },
    {
      id: 'finances',
      label: 'الحسابات والأرباح',
      route: '/finances',
      icon: LucideTrendingUp,
    },
  ];
}
