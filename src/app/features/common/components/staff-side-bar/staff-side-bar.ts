import { Component, computed, inject, input, output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../../core/Services/theme';
import { LanguageService } from '../../../../core/Services/language';
import { AuthService } from '../../../../core/Services/auth';
import { AppRole } from '../../../../core/enums/role-enum';
import { PolicyEnum } from '../../../teacher/pages/my-assistants/assistants.model';
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
  lucideSlidersHorizontal,
  lucideDollarSign,
  lucideHelpCircle,
} from '@ng-icons/lucide';
import { AuthStore } from '../../../../core/stores/auth.store';
import { NavItem } from '../../../../core/Models/Common/navigation.model';

@Component({
  selector: 'app-staff-side-bar',
  imports: [RouterLink, RouterLinkActive, NgIcon],
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
      lucideFileText,
      lucideSlidersHorizontal,
      lucideDollarSign,
      lucideHelpCircle,
    }),
  ],
})
export class StaffSideBar {
  public readonly themeService = inject(ThemeService);
  public readonly langService = inject(LanguageService);
  public readonly auth = inject(AuthService);
  public readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);

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

  /** Make the template react to language changes by reading lang signal */
  private readonly lang = computed(() => this.langService.lang());

  public readonly teacherSubject = computed(() => {
    // Reactively depends on lang changes via `lang`
    this.lang();
    switch (this.normalizedRole()) {
      case AppRole.ASSISTANT:
        return this.translate.instant('ROLES.ASSISTANT');
      case AppRole.ADMIN:
        return this.translate.instant('ROLES.ADMIN');
      case AppRole.TEACHER:
      default:
        return this.translate.instant('ROLES.TEACHER');
    }
  });

  TEACHER_NAV_ITEMS: NavItem[] = [
    {
      id: 'dashboard',
      labelKey: 'SIDEBAR.DASHBOARD',
      route: '/dashboard',
      icon: 'lucideLayoutDashboard',
    },
    {
      id: 'lessons',
      labelKey: 'SIDEBAR.LESSONS',
      route: '/dashboard/mylessons',
      icon: 'lucideBook',
    },
    {
      id: 'mystudents',
      labelKey: 'SIDEBAR.MY_STUDENTS',
      route: '/dashboard/mystudents',
      icon: 'lucideUsers',
    },
    {
      id: 'mycodess',
      labelKey: 'SIDEBAR.CODES',
      route: '/dashboard/mycodes',
      icon: ' lucideBinary',
    },
    {
      id: 'myexams',
      labelKey: 'SIDEBAR.EXAMS',
      route: '/dashboard/myexams',
      icon: 'lucideSquarePen',
    },
    {
      id: 'finances',
      labelKey: 'SIDEBAR.FINANCES',
      route: '/dashboard/myfinances',
      icon: 'lucideTrendingUp',
    },
    {
      id: 'manage-assistants',
      labelKey: 'SIDEBAR.ASSISTANTS',
      route: '/dashboard/my-assistants',
      icon: 'lucideUserPlus',
    },
    {
      id: 'mypreference',
      labelKey: 'SIDEBAR.PREFERENCES',
      route: '/dashboard/mypreference',
      icon: 'lucideSlidersHorizontal',
    },
  ];

  ADMIN_NAV_ITEMS: NavItem[] = [
    {
      id: 'dashboard',
      labelKey: 'SIDEBAR.DASHBOARD',
      route: '/dashboard/admin',
      icon: 'lucideLayoutDashboard',
    },
    { id: 'users', labelKey: 'SIDEBAR.USERS', route: '/dashboard/users', icon: 'lucideUsers' },
    {
      id: 'lessons-review',
      labelKey: 'SIDEBAR.LESSONS_REVIEW',
      route: '/dashboard/mylessons',
      icon: 'lucideBookOpenCheck',
    },
    {
      id: 'activity-log',
      labelKey: 'SIDEBAR.ACTIVITY_LOG',
      route: '/dashboard/activity-log',
      icon: 'lucideFileText',
    },
    {
      id: 'finance',
      labelKey: 'SIDEBAR.FINANCE',
      route: '/dashboard/myfinances',
      icon: 'lucideDollarSign',
    },
    {
      id: 'settings',
      labelKey: 'SIDEBAR.SETTINGS',
      route: '/dashboard/mypreference',
      icon: 'lucideSettings',
    },
  ];

  ASSISTANT_NAV_ITEMS: NavItem[] = [
    {
      id: 'dashboard',
      labelKey: 'SIDEBAR.DASHBOARD',
      route: '/dashboard/assistant',
      icon: 'lucideLayoutDashboard',
    },
    {
      id: 'mystudents',
      labelKey: 'SIDEBAR.MY_STUDENTS',
      route: '/dashboard/mystudents',
      icon: 'lucideUsers',
      permission: PolicyEnum.CanManageEnrollments,
    },
    {
      id: 'mycodes',
      labelKey: 'SIDEBAR.CODES',
      route: '/dashboard/mycodes',
      icon: 'lucideBinary',
      permission: PolicyEnum.CanManageEnrollments,
    },
    {
      id: 'manage-content',
      labelKey: 'SIDEBAR.CONTENT',
      route: '/dashboard/lessons',
      icon: 'lucideLayers',
      permission: PolicyEnum.CanManageContent,
    },
    {
      id: 'grading',
      labelKey: 'SIDEBAR.EXAMS',
      route: '/dashboard/myexams',
      icon: 'lucideSquarePen',
      permission: PolicyEnum.CanEvaluateStudents,
    },
    {
      id: 'send-reports',
      labelKey: 'SIDEBAR.SEND_REPORTS',
      route: '/dashboard/mystudents/report',
      icon: 'lucideMail',
      permission: PolicyEnum.CanViewReports,
    },
    {
      id: 'assistant-activity-log',
      labelKey: 'SIDEBAR.ACTIVITY_LOG',
      route: '/dashboard/myactivity-log',
      icon: 'lucideFileText',
    },
  ];

  public readonly navItems = computed(() => {
    // Reactively depends on lang changes via `lang`
    this.lang();
    const items = (() => {
      switch (this.normalizedRole()) {
        case AppRole.ADMIN:
          return this.ADMIN_NAV_ITEMS;
        case AppRole.ASSISTANT:
          return this.ASSISTANT_NAV_ITEMS;
        case AppRole.TEACHER:
        default:
          return this.TEACHER_NAV_ITEMS;
      }
    })();

    const userPermissions = this.authStore.user()?.permissions ?? [];

    return items
      .filter((item) => !item.permission || userPermissions.includes(item.permission))
      .map((item) => ({ ...item, label: this.translate.instant(item.labelKey) }));
  });

  public readonly themeLabel = computed(() => {
    this.lang();
    return this.translate.instant(
      this.themeService.theme() === 'dark' ? 'SIDEBAR.LIGHT_MODE' : 'SIDEBAR.DARK_MODE',
    );
  });

  public readonly logoutLabel = computed(() => {
    this.lang();
    return this.translate.instant('SIDEBAR.LOGOUT');
  });

  public readonly langToggleLabel = computed(() => {
    this.lang();
    return this.langService.lang() === 'ar'
      ? this.translate.instant('SIDEBAR.ARABIC')
      : this.translate.instant('SIDEBAR.ENGLISH');
  });

  public readonly langToggleIcon = computed(() => (this.langService.lang() === 'ar' ? 'ع' : 'E'));
  /** Returns the correct translate class for the mobile sidebar based on direction */
  public readonly sidebarClosedClass = computed(() => {
    this.lang();
    return this.langService.lang() === 'ar' ? 'translate-x-full' : '-translate-x-full';
  });
}
