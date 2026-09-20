import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { bootstrapX } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorSidebarSimple } from '@ng-icons/phosphor-icons/regular';
import { filter } from 'rxjs';
import { StaffSideBarComponent } from '../../features/common/components/staff-side-bar/staff-side-bar';
import { Toast } from '../../features/common/components/toast/toast';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, StaffSideBarComponent, Toast, NgIcon],
  templateUrl: './dashboard-layout.html',
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
export class DashboardLayout {
  protected readonly mobileMenuOpen = signal<boolean>(false);
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

  private readonly router = inject(Router);
  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  constructor() {
    // Dashboard routes scroll inside their own shell element (`#scrollContainer`),
    // not the document, so Angular's `withInMemoryScrolling` can never reset it.
    // Without this the previous route's scroll offset carries over and the next
    // page renders mid-scroll — a jarring jump when moving between a long page
    // and a short one.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.scrollContainer()?.nativeElement.scrollTo({ top: 0, left: 0 }));
  }
}
