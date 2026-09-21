import { Component, computed, DOCUMENT, inject, model } from '@angular/core';
import { bootstrapList, bootstrapX } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  navbarEntranceTransition,
  navbarOverlayTransition,
  navbarSidebarTransition,
} from '../../../../core/animations/motion.animations';
import { AuthService } from '../../../../core/Services/auth';
import { LanguageService } from '../../../../core/Services/language';
import { AuthButtons } from './components/auth-buttons/auth-buttons';
import { NavLinksComponent } from './components/nav-links/nav-links';
import { NavLogoComponent } from './components/nav-logo/nav-logo';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-navbar',
  imports: [
    NavLogoComponent,
    ThemeToggleComponent,
    NavLinksComponent,
    AuthButtons,
    ProfileMenuComponent,
    TranslatePipe,
    NgmMotionDirective,
    NgIcon,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  viewProviders: [
    provideIcons({
      bootstrapList,
      bootstrapX,
    }),
  ],
})
export class NavbarComponent {
  private readonly document = inject(DOCUMENT);
  private readonly authService = inject(AuthService);
  protected readonly langService = inject(LanguageService);
  // isScrolled    = signal(false);
  public readonly isSidebarOpen = model(false);

  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly userName = computed(() => this.authService.name());
  protected readonly userEmail = computed(() => this.authService.email());
  protected readonly navbarEntranceTransition = navbarEntranceTransition;
  protected readonly overlayTransition = navbarOverlayTransition;
  protected readonly sidebarTransition = navbarSidebarTransition;

  /** On-canvas drawer target: flush against the inline-start edge. */
  protected readonly sidebarOpenState = { x: 0, opacity: 1 };

  /**
   * Off-canvas drawer target. The panel is anchored with `inset-s-0`, so "hidden"
   * is direction dependent: it must slide out towards `+X` in RTL (where the panel
   * sits against the RIGHT edge) and towards `-X` in LTR.
   *
   * A hardcoded `-100%` is only correct for LTR — in RTL it parked the panel
   * *inside* the viewport at `opacity: 0`, where it silently swallowed every
   * pointer event over a 280px-wide column of the page.
   */
  protected readonly sidebarClosedState = computed(() => ({
    x: this.langService.lang() === 'ar' ? '100%' : '-100%',
    opacity: 0,
  }));

  // @HostListener('window:scroll')
  // onScroll() {
  //   this.isScrolled.set(window.scrollY > 20);
  // }

  protected toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
    this.toggleBodyScroll();
  }

  protected closeSidebar() {
    this.isSidebarOpen.set(false);
    this.toggleBodyScroll();
  }

  private toggleBodyScroll() {
    if (this.isSidebarOpen()) {
      this.document.body.style.overflow = 'hidden';
    } else {
      this.document.body.style.overflow = '';
    }
  }
}
