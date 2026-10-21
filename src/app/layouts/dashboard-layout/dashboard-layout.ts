import { Dir } from '@angular/cdk/bidi';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { bootstrapX } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorSidebarSimple } from '@ng-icons/phosphor-icons/regular';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { map } from 'rxjs';
import { fadeTransition } from '../../core/animations/navigation.animations';
import { LanguageService } from '../../core/Services/language';
import { StaffSideBarComponent } from '../../features/common/components/staff-side-bar/staff-side-bar';

/** Tailwind's `md` breakpoint, the width where the rail becomes permanent. */
const MOBILE_BREAKPOINT = '(max-width: 47.99rem)';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, StaffSideBarComponent, NgIcon, MatSidenavModule, NgmMotionDirective, Dir],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  host: {
    '[attr.data-route]': '"dashboard"',
  },
  viewProviders: [
    provideIcons({
      bootstrapX,
      phosphorSidebarSimple,
    }),
  ],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class DashboardLayout {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly langService = inject(LanguageService);

  /**
   * The drawer is position-aware, but `Directionality` only samples the document
   * once. Providing the direction through the `Dir` directive keeps the drawer on
   * the correct edge when the language is switched at runtime.
   */
  protected readonly direction = computed(() => (this.langService.lang() === 'ar' ? 'rtl' : 'ltr'));

  /** Below `md` the rail becomes a modal drawer with a scrim. */
  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_BREAKPOINT).pipe(map((state) => state.matches)),
    {
      initialValue:
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? window.matchMedia(MOBILE_BREAKPOINT).matches
          : false,
    },
  );

  /**
   * Drawer state on mobile. It resets whenever the breakpoint changes, so a
   * drawer left open on a phone never pops open on the desktop shell (or on the
   * next phone visit).
   */
  protected readonly mobileMenuOpen = linkedSignal<boolean, boolean>({
    source: this.isMobile,
    computation: () => false,
  });

  /** Shared with the sidebar so the page padding tracks the rail width. */
  protected readonly desktopSidebarExpanded = signal<boolean>(true);

  /**
   * Inline anchor of the mobile drawer toggle.
   *
   * Closed: the button sits on the drawer's leading edge (`inset-s-4`). Open: it
   * travels to just outside the drawer's trailing edge — the drawer is `w-60`
   * (15rem) wide, so 15rem + the same 1rem gutter keeps the button riding along
   * the drawer's outer rim instead of leaving it parked on top of the drawer's
   * own header. `inset-inline-start` is a logical property, so the same value
   * mirrors itself in RTL, and the transition shares the drawer's
   * `duration-260 ease-out` so both pieces move in lockstep.
   */
  protected readonly mobileToggleClass = computed(() =>
    this.mobileMenuOpen() ? 'inset-s-[calc(15rem+1rem)]' : 'inset-s-4',
  );

  protected readonly fadeTransition = fadeTransition;

  /** Keeps our mobile state in sync with drawer events (backdrop, Escape). */
  protected onDrawerOpenedChange(opened: boolean): void {
    if (this.isMobile()) this.mobileMenuOpen.set(opened);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  // private readonly router = inject(Router);
  // private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  // constructor() {
  //   // Dashboard routes scroll inside their own shell element (`#scrollContainer`),
  //   // not the document, so Angular's `withInMemoryScrolling` can never reset it.
  //   // Without this the previous route's scroll offset carries over and the next
  //   // page renders mid-scroll — a jarring jump when moving between a long page
  //   // and a short one.
  //   this.router.events
  //     .pipe(
  //       filter((event): event is NavigationEnd => event instanceof NavigationEnd),
  //       takeUntilDestroyed(),
  //     )
  //     .subscribe(() => this.scrollContainer()?.nativeElement.scrollTo({ top: 0, left: 0 }));
  // }
}
