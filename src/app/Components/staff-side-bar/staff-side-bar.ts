import { Component, inject, input, output, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/Services/theme'; // Adjust this path if necessary
import { AuthService } from '../../core/Services/auth';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBook,
  lucideLayoutDashboard,
  lucideTrendingUp,
  lucideUserPlus,
  lucideUsers,
  lucideSquarePen,
} from '@ng-icons/lucide';
interface UserInfo {
  teacherInitial: string;
  teacherName: string;
  subject: string;
}
@Component({
  selector: 'app-staff-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './staff-side-bar.html',
  viewProviders: [
    provideIcons({
      lucideLayoutDashboard,
      lucideBook,
      lucideUsers,
      lucideUserPlus,
      lucideTrendingUp,
      lucideSquarePen,
    }),
  ],
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

  public readonly navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      route: '/dashboard',
      icon: 'lucideLayoutDashboard',
    },
    {
      id: 'lessons',
      label: 'الدروس المرفوعة',
      route: '/dashboard/mylessons',
      icon: 'lucideBook',
    },
    {
      id: 'mystudents',
      label: 'قائمة الطلاب',
      route: '/dashboard/mystudents',
      icon: 'lucideUsers',
    },
    {
      id: 'myexams',
      label: 'التصحيح والتقييم',
      route: '/dashboard/myexams',
      icon: 'lucideSquarePen',
    },
    {
      id: 'finances',
      label: 'الحسابات والأرباح',
      route: '/dashboard/finances',
      icon: 'lucideTrendingUp',
    },
    {
      id: 'manage-assistants',
      label: 'المساعدون',
      route: '/dashboard/my-assistants',
      icon: 'lucideUserPlus',
    },
  ];
}
