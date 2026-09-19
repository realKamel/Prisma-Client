import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { bootstrapCardChecklist } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBinary,
  lucideBook,
  lucideBookOpenCheck,
  lucideChevronDown,
  lucideChevronsLeft,
  lucideChevronsRight,
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
import { phosphorMoonBold, phosphorSunBold } from '@ng-icons/phosphor-icons/bold';
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
  stateSwapTransition,
} from '../../../../core/animations/motion.animations';
import {
  fadeTransition,
  sidebarItemTap,
  sidebarItemTransition,
  sidebarLabelTransition,
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
      lucideChevronsLeft,
      lucideChevronsRight,
      phosphorUsersThreeDuotone,
      bootstrapCardChecklist,
      phosphorMoonBold,
      phosphorSunBold,
    }),
  ],
})
export class StaffSideBarComponent {
  public readonly themeService = inject(ThemeService);
  public readonly langService = inject(LanguageService);
  public readonly auth = inject(AuthService);
  public readonly authStore = inject(AuthStore);

  public readonly isMobileMenuOpen = input<boolean>(false);
  /**
   * Two-way: whether the desktop (`lg` and up) rail shows its labels or is
   * collapsed to the icon-only rail. Owned by the dashboard layout so the page
   * content can match the rail width with its own padding.
   */
  public readonly isDesktopExpanded = model<boolean>(true);
  public readonly toggleMobileMenu = output<void>();

  /** True while the desktop rail is collapsed down to icons only. */
  protected readonly isDesktopCollapsed = computed(() => !this.isDesktopExpanded());

  /**
   * ng-motion target shared by every sidebar caption: revealed while the rail is
   * expanded, faded and nudged towards its icon while the rail is collapsed. The
   * captions stay `whitespace-nowrap` + `overflow-hidden`, so the shrinking rail
   * clips their text instead of reflowing it onto extra lines.
   *
   * The mobile drawer is excluded because it is a full-width overlay that always
   * shows its captions, whichever state the desktop rail was left in.
   */
  protected readonly navLabelMotion = computed(() =>
    this.isDesktopCollapsed() && !this.isMobileMenuOpen()
      ? { opacity: 0, x: this.langService.lang() === 'ar' ? 8 : -8 }
      : { opacity: 1, x: 0 },
  );

  /**
   * Label visibility shared by every sidebar caption. Hidden from `md` up (the
   * tablet rail and the collapsed desktop rail are icons only), but always
   * visible below `md`, where the sidebar is a full-width mobile drawer.
   */
  protected readonly navLabelClass = computed(() =>
    this.isDesktopExpanded() ? 'md:hidden lg:inline-block' : 'md:hidden',
  );

  /** Same as {@link navLabelClass} for the `block`-level header/user caption. */
  protected readonly headerLabelClass = computed(() =>
    this.isDesktopExpanded() ? 'md:hidden lg:block' : 'md:hidden',
  );

  /** Sub-menu padding panel: `flex` column only while the rail is expanded. */
  protected readonly subMenuPanelClass = computed(() =>
    this.isDesktopExpanded() ? 'md:hidden lg:flex' : 'md:hidden',
  );

  /** i18n key of the collapse/expand toggle, which also names it for screen readers. */
  protected readonly collapseLabelKey = computed(() =>
    this.isDesktopExpanded() ? 'SIDEBAR.COLLAPSE' : 'SIDEBAR.EXPAND',
  );

  /** i18n key of the theme toggle, which also names it for screen readers. */
  protected readonly themeToggleLabelKey = computed(() =>
    this.themeService.theme() === 'dark' ? 'SIDEBAR.LIGHT_MODE' : 'SIDEBAR.DARK_MODE',
  );

  /**
   * Class list for a collapsible group's disclosure chevron: hidden in the icon
   * rails (`md`, and `lg` while collapsed) and rotated while its list is open.
   */
  protected subMenuChevronClass(menuId: string): string {
    const visibility = this.isDesktopExpanded() ? 'md:hidden lg:inline-flex' : 'md:hidden';
    return this.isSubMenuOpen(menuId) ? `${visibility} rotate-180` : visibility;
  }

  /**
   * The rail toggle keeps BOTH chevrons mounted (see the template) so the swap
   * springs instead of snapping while the rail collapses. This flag picks the
   * visible glyph: the inline-end chevron while collapsed (expand) and the
   * inline-start one while expanded (collapse). Because the glyphs never flip
   * themselves, the answer is mirrored for RTL — a left chevron reads as
   * "collapse" in LTR but as "expand" in RTL.
   */
  protected readonly collapseIconIsLeft = computed(
    () => this.isDesktopExpanded() !== (this.langService.lang() === 'ar'),
  );

  /** Collapse/expand the desktop rail. Used by the toggle in the sidebar footer. */
  public toggleDesktopSidebar(): void {
    const expanded = !this.isDesktopExpanded();

    // The icon rail cannot render disclosure lists, so close them on the way in
    // (leaves no stale highlight on the parent) and let them start closed on the way out.
    if (!expanded) this.expandedSubMenus.set(new Set());

    this.isDesktopExpanded.set(expanded);
  }

  /** State tracking for expanded parent sub-menus */
  public readonly expandedSubMenus = signal<Set<string>>(new Set());

  public toggleSubMenu(menuId: string): void {
    // While collapsed the rail only shows icons, so there is no list to open —
    // the parent icon simply navigates to its own route instead.
    if (this.isDesktopCollapsed()) return;

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
  protected readonly sidebarLabelTransition = sidebarLabelTransition;
  /** Spring driving the rail toggle's chevron swap — see motion.animations.ts. */
  protected readonly stateSwapTransition = stateSwapTransition;
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
      route: '/dashboard/subscriptions',
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
