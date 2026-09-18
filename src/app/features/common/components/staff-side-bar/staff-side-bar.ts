import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { bootstrapCardChecklist } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBinary,
  lucideBook,
  lucideBookOpenCheck,
  lucideChevronDown,
  lucideDollarSign,
  lucideFileText,
  lucideHelpCircle,
  lucideLayers,
  lucideLayoutDashboard,
  lucideLifeBuoy,
  lucideMail,
  lucideSettings,
  lucideShieldCheck,
  lucideSlidersHorizontal,
  lucideSquarePen,
  lucideTrendingUp,
  lucideUpload,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import { phosphorUsersThreeDuotone } from '@ng-icons/phosphor-icons/duotone';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { NavItem } from '../../../../core/Models/Common/navigation.model';
import { AuthService } from '../../../../core/Services/auth';
import { LanguageService } from '../../../../core/Services/language';
import { ThemeService } from '../../../../core/Services/theme';
import {
  sidebarActionIconVariants,
  sidebarActionVariants,
} from '../../../../core/animations/motion.animations';
import {
  fadeTransition,
  sidebarItemTap,
  sidebarItemTransition,
  sidebarSubItemStaggerBase,
  sidebarSubItemStaggerStep,
} from '../../../../core/animations/navigation.animations';
import { AppRole } from '../../../../core/enums/role-enum';
import { AuthStore } from '../../../../core/stores/auth.store';
import { PolicyEnum } from '../../../teacher/pages/my-assistants/assistants.model';

@Component({
  selector: 'app-staff-side-bar',
  imports: [RouterLink, RouterLinkActive, NgIcon, TranslatePipe, NgmMotionDirective],
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
      lucideChevronDown,
      phosphorUsersThreeDuotone,
      bootstrapCardChecklist,
    }),
  ],
})
export class StaffSideBarComponent {
  public readonly themeService = inject(ThemeService);
  public readonly langService = inject(LanguageService);
  public readonly auth = inject(AuthService);
  public readonly authStore = inject(AuthStore);

  public readonly isMobileMenuOpen = input<boolean>(false);
  public readonly isDesktopExpanded = input<boolean>(true);
  public readonly toggleMobileMenu = output<void>();

  /** State tracking for expanded parent sub-menus */
  public readonly expandedSubMenus = signal<Set<string>>(new Set());

  public toggleSubMenu(menuId: string): void {
    const current = new Set(this.expandedSubMenus());
    if (current.has(menuId)) {
      current.delete(menuId);
    } else {
      current.add(menuId);
    }
    this.expandedSubMenus.set(current);
  }

  public isSubMenuOpen(menuId: string): boolean {
    return this.expandedSubMenus().has(menuId);
  }

  /** Variant trigger for sidebar action buttons — see motion.animations.ts. */
  protected readonly sidebarActionVariants = sidebarActionVariants;
  /** Matching child variants applied to the icon inside those buttons. */
  protected readonly sidebarActionIconVariants = sidebarActionIconVariants;
  protected readonly fadeTransition = fadeTransition;
  protected readonly sidebarItemTransition = sidebarItemTransition;
  protected readonly sidebarItemTap = sidebarItemTap;
  /** Stagger timing for the nested sub-menu links, driven by the @for index. */
  protected readonly sidebarSubItemStaggerBase = sidebarSubItemStaggerBase;
  protected readonly sidebarSubItemStaggerStep = sidebarSubItemStaggerStep;

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
        return 'ROLES.ASSISTANT';
      case AppRole.ADMIN:
        return 'ROLES.ADMIN';
      case AppRole.TEACHER:
      default:
        return 'ROLES.TEACHER';
    }
  });

  protected readonly TEACHER_NAV_ITEMS: NavItem[] = [
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
      icon: 'lucideBinary',
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
  ];

  protected readonly ADMIN_NAV_ITEMS: NavItem[] = [
    {
      id: 'dashboard',
      labelKey: 'SIDEBAR.DASHBOARD',
      route: '/dashboard/admin',
      icon: 'lucideLayoutDashboard',
    },
    {
      id: 'users',
      labelKey: 'SIDEBAR.USERS.TITLE',
      route: '/dashboard/users',
      icon: 'lucideUsers',
      children: [
        {
          id: 'menu',
          labelKey: 'SIDEBAR.USERS.MENU',
          route: '/dashboard/users',
          icon: 'phosphorUsersThreeDuotone',
        },
        {
          id: 'add',
          labelKey: 'SIDEBAR.USERS.ADD',
          route: '/dashboard/users/add',
          icon: 'lucideUserPlus',
        },
      ],
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
      id: 'subscription-management',
      labelKey: 'SIDEBAR.SUBSCRIPTION_MANAGEMENT',
      route: '/dashboard/teachers',
      icon: 'bootstrapCardChecklist',
    },
    {
      id: 'settings',
      labelKey: 'SIDEBAR.SETTINGS',
      route: '/dashboard/mypreference',
      icon: 'lucideSettings',
    },
  ];

  protected readonly ASSISTANT_NAV_ITEMS: NavItem[] = [
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
      .map((item) => {
        if (!item.children) return item;
        return {
          ...item,
          children: item.children.filter(
            (child) => !child.permission || userPermissions.includes(child.permission),
          ),
        };
      });
  });
}
