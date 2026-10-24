import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { bootstrapCardChecklist, bootstrapCloudUpload } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBinary,
  lucideBook,
  lucideBookOpenCheck,
  lucideBookPlus,
  lucideChevronDown,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucideClipboardList,
  lucideDollarSign,
  lucideFileText,
  lucideHelpCircle,
  lucideHistory,
  lucideLayers,
  lucideLayoutDashboard,
  lucideLifeBuoy,
  lucideMail,
  lucideMessageCircleMore,
  lucideSettings,
  lucideShieldCheck,
  lucideSlidersHorizontal,
  lucideSquarePen,
  lucideTrendingUp,
  lucideUpload,
  lucideUserPlus,
  lucideUsers,
} from '@ng-icons/lucide';
import {
  phosphorColumnsPlusLeftBold,
  phosphorMoonBold,
  phosphorPlusCircleBold,
  phosphorSunBold,
} from '@ng-icons/phosphor-icons/bold';
import {
  phosphorBarcodeDuotone,
  phosphorUsersThreeDuotone,
} from '@ng-icons/phosphor-icons/duotone';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { filter, fromEvent, map, of } from 'rxjs';
import { NavItem } from '../../../../core/Models/Common/navigation.model';
import { AuthService } from '../../../../core/Services/auth';
import { ChatStoreService } from '../../../../core/Services/Chat/chat-store.service';
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
      lucideBookPlus,
      lucideUpload,
      lucideLayers,
      lucideMail,
      lucideMessageCircleMore,
      lucideBinary,
      lucideFileText,
      lucideSlidersHorizontal,
      lucideDollarSign,
      lucideHelpCircle,
      lucideChevronDown,
      lucideChevronsLeft,
      lucideChevronsRight,
      lucideClipboardList,
      lucideHistory,
      phosphorUsersThreeDuotone,
      bootstrapCardChecklist,
      phosphorMoonBold,
      phosphorSunBold,
      bootstrapCloudUpload,
      phosphorBarcodeDuotone,
      phosphorColumnsPlusLeftBold,
      phosphorPlusCircleBold,
    }),
  ],
})
export class StaffSideBarComponent {
  public readonly themeService = inject(ThemeService);
  public readonly langService = inject(LanguageService);
  public readonly auth = inject(AuthService);
  public readonly authStore = inject(AuthStore);
  public readonly chatStore = inject(ChatStoreService);

  /** Unread message badge shared by every staff role. */
  public readonly chatUnread = this.chatStore.totalUnread;

  private readonly router = inject(Router);

  /**
   * Current URL as a signal, so the rail can tell whether the user is sitting
   * somewhere inside a collapsible group's nested routes.
   */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  public readonly isMobileMenuOpen = input<boolean>(false);
  /**
   * Two-way: whether the desktop (`lg` and up) rail shows its labels or is
   * collapsed to the icon-only rail. Owned by the dashboard layout so the page
   * content can match the rail width with its own padding.
   */
  public readonly isDesktopExpanded = model<boolean>(true);
  /**
   * Raised when a link was followed, so the mobile drawer can dismiss itself.
   * It only ever asks to close — emitting a "toggle" here would pop the drawer
   * (and its scrim) open when the same link is clicked on desktop.
   */
  public readonly closeMobileMenu = output<void>();

  /**
   * Match options for a parent's nested links: the path must match exactly, but
   * query params are ignored so a filtered route (e.g. `?quizId=`) still lights
   * its own link up.
   */
  protected readonly childLinkActiveOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };

  /** True while the desktop rail is collapsed down to icons only. */
  protected readonly isDesktopCollapsed = computed(() => !this.isDesktopExpanded());

  /** Tailwind's `lg` breakpoint, when the environment implements media queries. */
  private readonly lgViewportQuery: MediaQueryList | null =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 64rem)')
      : null;

  /**
   * Below `lg` the rail is always the icon-only strip (`md:w-16`, labels and
   * disclosure lists hidden by `md:hidden`), whichever state the collapse toggle
   * was left in, so the viewport has to be tracked separately. Environments
   * without media queries report "not below `lg`", leaving the toggle in charge.
   */
  private readonly isBelowLargeViewport = toSignal(
    this.lgViewportQuery
      ? fromEvent<MediaQueryListEvent>(this.lgViewportQuery, 'change').pipe(map((e) => !e.matches))
      : of(false),
    { initialValue: this.lgViewportQuery ? !this.lgViewportQuery.matches : false },
  );

  /**
   * True whenever the rail renders icons only: the `md` strip, or `lg` while
   * collapsed. Those are exactly the states that drop the nested links.
   */
  private readonly isIconOnlyRail = computed(
    () => this.isBelowLargeViewport() || this.isDesktopCollapsed(),
  );

  /**
   * True while the captions should fade away: the desktop rail is collapsed and
   * the mobile drawer is not the surface on screen (that overlay always shows
   * its captions, whichever state the desktop rail was left in).
   */
  private readonly isLabelHidden = computed(
    () => this.isDesktopCollapsed() && !this.isMobileMenuOpen(),
  );

  /**
   * Caption state for every sidebar label: revealed while the rail is expanded,
   * faded and nudged towards its icon while it is collapsed.
   *
   * This is plain CSS on purpose. Animating it through ng-motion kept a spring
   * ticking on every caption for ~500 ms after the rail had already stopped, and
   * the rail's own width transition is main-thread bound, so `opacity` and
   * `translate` are left to the compositor instead.
   */
  private readonly labelStateClass = computed(() => {
    const hidden = this.isLabelHidden();
    const towardIcon = this.langService.lang() === 'ar' ? 'translate-x-2' : '-translate-x-2';
    const state = hidden ? `${towardIcon} opacity-0` : 'translate-x-0 opacity-100';

    return `transition-[opacity,translate] duration-200 ease-out ${state}`;
  });

  /**
   * Label visibility shared by every sidebar caption. Hidden from `md` up (the
   * tablet rail and the collapsed desktop rail are icons only), but always
   * visible below `md`, where the sidebar is a full-width mobile drawer.
   */
  protected readonly navLabelClass = computed(
    () =>
      `${this.isDesktopExpanded() ? 'md:hidden lg:inline-block' : 'md:hidden'} ${this.labelStateClass()}`,
  );

  /** Same as {@link navLabelClass} for the `block`-level header/user caption. */
  protected readonly headerLabelClass = computed(
    () =>
      `${this.isDesktopExpanded() ? 'md:hidden lg:block' : 'md:hidden'} ${this.labelStateClass()}`,
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

  /**
   * True while the current URL sits inside the item's own route or one of its
   * nested child routes — i.e. the user is somewhere within that section.
   * Query strings, fragments and trailing slashes are ignored on both sides.
   */
  protected isNavSectionActive(item: NavItem): boolean {
    const url = this.currentUrl().split(/[?#]/)[0].replace(/\/+$/, '');
    const isInside = (route: string) => {
      const path = route.replace(/\/+$/, '');
      return url === path || url.startsWith(`${path}/`);
    };

    return isInside(item.route) || (item.children ?? []).some((child) => isInside(child.route));
  }

  /**
   * The icon-only rail renders no nested links, so a collapsible parent has to
   * carry the state on its own: it stays lit while the user is inside its routes,
   * keeping the collapsed rail in sync with the page.
   *
   * The mobile drawer is excluded — it is a full-width overlay that renders the
   * nested links, which already highlight themselves with `routerLinkActive`.
   */
  protected isCollapsedSectionActive(item: NavItem): boolean {
    return this.isIconOnlyRail() && !this.isMobileMenuOpen() && this.isNavSectionActive(item);
  }

  /**
   * True while an expanded rail is sitting inside the section's routes — the
   * expanded-rail counterpart of {@link isCollapsedSectionActive}. The mobile
   * drawer is excluded for the same reason: its nested links already highlight
   * themselves with `routerLinkActive`.
   */
  private isSectionCurrent(item: NavItem): boolean {
    return !this.isMobileMenuOpen() && this.isNavSectionActive(item);
  }

  /**
   * State classes for a collapsible parent button, strongest tier first: the
   * collapsed rail keeps the solid fill (it is the only thing telling the user
   * where they are), an expanded rail tints the group holding the current page,
   * and an open group merely lifts its label.
   *
   * The resting colour lives here rather than in the static class list so only
   * one colour is ever applied — no reliance on stylesheet ordering.
   */
  protected parentButtonStateClass(item: NavItem): string {
    if (this.isCollapsedSectionActive(item)) {
      return 'bg-primary text-white shadow-[0_4px_16px_var(--color-primary-glow)]';
    }

    if (this.isSectionCurrent(item)) {
      return 'bg-primary/10 text-ink';
    }

    return this.isSubMenuOpen(item.id) ? 'text-ink' : 'text-ink-subtle';
  }

  /**
   * Fill for a collapsible group's container while its sub-menu is open.
   *
   * The rail is itself `bg-surface-subtle`, so the group needs a tint — a second
   * surface token would render invisibly against it. `pb-3` belongs only to the
   * expanded presentation, otherwise collapsing the rail while a sub-menu is open
   * leaves stray padding around the icon button.
   */
  protected parentGroupClass(item: NavItem): string {
    if (!this.isSubMenuOpen(item.id)) return '';

    return this.isDesktopExpanded() || this.isMobileMenuOpen() ? 'bg-primary/10 pb-3' : '';
  }

  /**
   * Icon opacity for a collapsible parent: at full strength while the rail is
   * inside the current section, dimmed otherwise (brightening on hover).
   */
  protected parentIconStateClass(item: NavItem): string {
    return this.isSectionCurrent(item) ? 'opacity-100' : 'opacity-70 group-hover:opacity-100';
  }

  /** Variant trigger for sidebar action buttons — see motion.animations.ts. */
  protected readonly sidebarActionVariants = sidebarActionVariants;
  /** Matching child variants applied to the icon inside those buttons. */
  protected readonly sidebarActionIconVariants = sidebarActionIconVariants;
  protected readonly fadeTransition = fadeTransition;
  protected readonly sidebarItemTransition = sidebarItemTransition;
  protected readonly sidebarItemTap = sidebarItemTap;
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
      id: 'messages',
      labelKey: 'SIDEBAR.MESSAGES',
      route: '/dashboard/messages',
      icon: 'lucideMessageCircleMore',
    },
    {
      id: 'lessons',
      labelKey: 'SIDEBAR.LESSONS.MENU',
      route: '/dashboard/mylessons',
      icon: 'lucideBook',
      children: [
        {
          id: 'lessons',
          labelKey: 'SIDEBAR.LESSONS.ALL_LESSONS',
          route: '/dashboard/mylessons',
          icon: 'lucideBook',
        },
        {
          id: 'lessons_add',
          labelKey: 'SIDEBAR.LESSONS.ADD_LESSON',
          route: 'mylessons/add',
          icon: 'phosphorPlusCircleBold',
        },
        {
          id: 'upload_materials',
          labelKey: 'SIDEBAR.LESSONS.UPLOAD_MATERIALS',
          route: 'mylessons/upload-materials',
          icon: 'bootstrapCloudUpload',
        },
      ],
    },
    {
      id: 'mystudents',
      labelKey: 'SIDEBAR.MY_STUDENTS.MENU',
      route: '/dashboard/mystudents',
      icon: 'lucideUsers',
      children: [
        {
          id: 'mystudents',
          labelKey: 'SIDEBAR.MY_STUDENTS.ALL_STUDENTS',
          route: '/dashboard/mystudents',
          icon: 'lucideUsers',
        },
        {
          id: 'mystudents',
          labelKey: 'SIDEBAR.MY_STUDENTS.ADD_STUDENT',
          route: '/dashboard/mystudents/add',
          icon: 'phosphorPlusCircleBold',
        },
      ],
    },
    {
      id: 'mycodess',
      labelKey: 'SIDEBAR.CODES.MENU',
      route: '/dashboard/mycodes',
      icon: 'phosphorBarcodeDuotone',
      children: [
        {
          id: 'mycodess',
          labelKey: 'SIDEBAR.CODES.ALL_CODES',
          route: '/dashboard/mycodes',
          icon: 'phosphorBarcodeDuotone',
        },
        {
          id: 'mycodess',
          labelKey: 'SIDEBAR.CODES.CREATE_NEW_CODE',
          route: '/dashboard/mycodes/generate-codes',
          icon: 'phosphorPlusCircleBold',
        },
      ],
    },
    {
      id: 'myexams',
      labelKey: 'SIDEBAR.EXAMS',
      route: '/dashboard/grading',
      icon: 'lucideSquarePen',
      children: [
        {
          id: 'grading_exams',
          labelKey: 'SIDEBAR.GRADING.EXAMS',
          route: '/dashboard/grading',
          icon: 'lucideSquarePen',
        },
        {
          id: 'grading_quizzes',
          labelKey: 'SIDEBAR.GRADING.QUIZZES',
          route: '/dashboard/grading/quiz',
          icon: 'lucideClipboardList',
        },
        {
          id: 'grading_exam_results',
          labelKey: 'SIDEBAR.GRADING.EXAM_RESULTS',
          route: '/dashboard/grading/exam-results',
          icon: 'lucideBookOpenCheck',
        },
        {
          id: 'grading_quiz_results',
          labelKey: 'SIDEBAR.GRADING.QUIZ_RESULTS',
          route: '/dashboard/grading/quiz-results',
          icon: 'lucideHistory',
        },
        {
          id: 'grading_assignments',
          labelKey: 'SIDEBAR.GRADING.ASSIGNMENTS',
          route: '/dashboard/grading/assignments',
          icon: 'lucideFileText',
        },
      ],
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
      id: 'send-reports',
      labelKey: 'SIDEBAR.SEND_REPORTS',
      route: '/dashboard/mystudents/report',
      icon: 'lucideMail',
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
      id: 'messages',
      labelKey: 'SIDEBAR.MESSAGES',
      route: '/dashboard/messages',
      icon: 'lucideMessageCircleMore',
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
      id: 'messages',
      labelKey: 'SIDEBAR.MESSAGES',
      route: '/dashboard/messages',
      icon: 'lucideMessageCircleMore',
    },
    {
      id: 'mystudents',
      labelKey: 'SIDEBAR.MY_STUDENTS.MENU',
      route: '/dashboard/mystudents',
      icon: 'lucideUsers',
      permission: PolicyEnum.CanManageEnrollments,
      children: [
        {
          id: 'mystudents',
          labelKey: 'SIDEBAR.MY_STUDENTS.ALL_STUDENTS',
          route: '/dashboard/mystudents',
          icon: 'lucideUsers',
        },
        {
          id: 'mystudents',
          labelKey: 'SIDEBAR.MY_STUDENTS.ADD_STUDENT',
          route: '/dashboard/mystudents/add',
          icon: 'phosphorPlusCircleBold',
        },
      ],
    },
    {
      id: 'mycodess',
      labelKey: 'SIDEBAR.CODES.MENU',
      route: '/dashboard/mycodes',
      icon: 'phosphorBarcodeDuotone',
      permission: PolicyEnum.CanManageEnrollments,
      children: [
        {
          id: 'mycodess',
          labelKey: 'SIDEBAR.CODES.ALL_CODES',
          route: '/dashboard/mycodes',
          icon: 'phosphorBarcodeDuotone',
        },
        {
          id: 'mycodess',
          labelKey: 'SIDEBAR.CODES.CREATE_NEW_CODE',
          route: '/dashboard/mycodes/generate-codes',
          icon: 'phosphorPlusCircleBold',
        },
      ],
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
      route: '/dashboard/grading',
      icon: 'lucideSquarePen',
      permission: PolicyEnum.CanEvaluateStudents,
      children: [
        {
          id: 'grading_exams',
          labelKey: 'SIDEBAR.GRADING.EXAMS',
          route: '/dashboard/grading',
          icon: 'lucideSquarePen',
        },
        {
          id: 'grading_quizzes',
          labelKey: 'SIDEBAR.GRADING.QUIZZES',
          route: '/dashboard/grading/quiz',
          icon: 'lucideClipboardList',
        },
        {
          id: 'grading_exam_results',
          labelKey: 'SIDEBAR.GRADING.EXAM_RESULTS',
          route: '/dashboard/grading/exam-results',
          icon: 'lucideBookOpenCheck',
        },
        {
          id: 'grading_quiz_results',
          labelKey: 'SIDEBAR.GRADING.QUIZ_RESULTS',
          route: '/dashboard/grading/quiz-results',
          icon: 'lucideHistory',
        },
        {
          id: 'grading_assignments',
          labelKey: 'SIDEBAR.GRADING.ASSIGNMENTS',
          route: '/dashboard/grading/assignments',
          icon: 'lucideFileText',
        },
      ],
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
