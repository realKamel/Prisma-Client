import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/Services/theme';
import { AuthService } from '../../core/Services/auth';
import { AppRole } from '../../core/enums/role-enum';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBook,
  lucideLayoutDashboard,
  lucideTrendingUp,
  lucideUserPlus,
  lucideUsers,
  lucideSquarePen,
  lucideSettings,
  lucideLifeBuoy,
  lucideShieldCheck,
  lucideBookOpenCheck,
  lucideUpload,
  lucideLayers,
  lucideMail,
  lucideFileText,                             
  lucideBinary,
  lucideSlidersHorizontal
} from '@ng-icons/lucide';

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string;
}

// ── Nav items per role ─────────────────────────
const TEACHER_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', route: '/dashboard', icon: 'lucideLayoutDashboard' },
  { id: 'lessons', label: 'الدروس المرفوعة', route: '/dashboard/mylessons', icon: 'lucideBook' },
  { id: 'mystudents', label: 'قائمة الطلاب', route: '/dashboard/mystudents', icon: 'lucideUsers' },
    { id: 'mycodess', label: 'الأكواد', route: '/dashboard/mycodes', icon: '                            lucideBinary' },
  { id: 'myexams', label: 'التصحيح والتقييم', route: '/dashboard/myexams', icon: 'lucideSquarePen' },
  { id: 'finances', label: 'الحسابات والأرباح', route: '/dashboard/myfinances', icon: 'lucideTrendingUp' },
  { id: 'manage-assistants', label: 'المساعدون', route: '/dashboard/my-assistants', icon: 'lucideUserPlus' },
    { id: 'mypreference', label: 'التخصيص', route: '/dashboard/mypreference', icon: 'lucideSlidersHorizontal' },

];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'users', label: 'إدارة المستخدمين', route: '/dashboard/users', icon: 'lucideUsers' },
  { id: 'settings', label: 'الإعدادات', route: '/dashboard/settings', icon: 'lucideSettings' },
  { id: 'assistant-dashboard', label: 'لوحة المساعدين', route: '/dashboard/Assistant', icon: 'lucideShieldCheck' },
  { id: 'support', label: 'الدعم الفني', route: '/dashboard/support', icon: 'lucideLifeBuoy' },
  { id: 'lessons-review', label: 'مراجعة الدروس', route: '/dashboard/lessons', icon: 'lucideBookOpenCheck' },
];

const ASSISTANT_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', route: '/dashboard/assistant', icon: 'lucideLayoutDashboard' },
  { id: 'manage-students', label: 'إدارة الطلاب', route: '/dashboard/mystudents', icon: 'lucideUsers' },
  { id: 'manage-content', label: 'إدارة المحتوى', route: '/dashboard/lessons', icon: 'lucideLayers' },
  { id: 'grading', label: 'التصحيح والتقييم', route: '/dashboard/myexams', icon: 'lucideSquarePen' },
  { id: 'send-reports', label: 'إرسال التقارير', route: '/dashboard/mystudents/report', icon: 'lucideMail' },
  { id: 'activity-log', label: 'سجل الأنشطة', route: '/dashboard/activity-log', icon: 'lucideFileText' },
];

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
      lucideSettings,
      lucideLifeBuoy,
      lucideShieldCheck,
      lucideBookOpenCheck,
      lucideUpload,
      lucideLayers,
      lucideMail,
      lucideBinary,
      lucideFileText,lucideSlidersHorizontal
    }),
  ],
})
export class StaffSideBar {
  public readonly themeService = inject(ThemeService);
  public readonly auth = inject(AuthService);

  public readonly isMobileMenuOpen = input<boolean>(false);
  public readonly isDesktopExpanded = input<boolean>(true);
  public readonly toggleMobileMenu = output<void>();

  public readonly teacherName = computed(() => this.auth.name() ?? '');

  public readonly teacherInitial = computed(() => {
    const name = this.teacherName().trim();
    return name.length > 0 ? name.charAt(0) : '؟';
  });

 
  private readonly normalizedRole = computed(
    () => this.auth.role()?.toString().toLowerCase() as AppRole | undefined,
  );

  public readonly teacherSubject = computed(() => {
    switch (this.normalizedRole()) {
      case AppRole.ASSISTANT:
        return 'مساعد تدريس';
      case AppRole.ADMIN:
        return 'مدير النظام';
      case AppRole.TEACHER:
      default:
        return 'معلم'; 
    }
  });

  get navItems(): NavItem[] {
    switch (this.normalizedRole()) {
      case AppRole.ADMIN:
        return ADMIN_NAV_ITEMS;
      case AppRole.ASSISTANT:
        return ASSISTANT_NAV_ITEMS;
      case AppRole.TEACHER:
      default:
        return TEACHER_NAV_ITEMS;
    }
  }
}