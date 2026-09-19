import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { StaffSideBarComponent } from '../../features/common/components/staff-side-bar/staff-side-bar';
import { Toast } from '../../features/common/components/toast/toast';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, StaffSideBarComponent, Toast],
  templateUrl: './dashboard-layout.html',
  host: {
    '[attr.data-route]': '"dashboard"',
  },
})
export class DashboardLayout {
  protected readonly mobileMenuOpen = signal<boolean>(false);
  /** Shared with the sidebar so the page padding tracks the rail width. */
  protected readonly desktopSidebarExpanded = signal<boolean>(true);

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
