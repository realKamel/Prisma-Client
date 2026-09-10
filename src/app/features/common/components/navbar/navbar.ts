import { Component, computed, DOCUMENT, inject, model } from '@angular/core';
import { NavLogoComponent } from './components/nav-logo/nav-logo';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle';
import { NavLinksComponent } from './components/nav-links/nav-links';
import { AuthButtons } from './components/auth-buttons/auth-buttons';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/Services/auth';
import { LanguageService } from '../../../../core/Services/language';
import { NgmMotionDirective } from '@scripttype/ng-motion';

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
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  private readonly document = inject(DOCUMENT);
  private readonly authService = inject(AuthService);
  protected readonly langService = inject(LanguageService);
  // isScrolled    = signal(false);
  readonly isSidebarOpen = model(false);

  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly userName = computed(() => this.authService.name());
  protected readonly userEmail = computed(() => this.authService.email());
  protected readonly sidebarTransition = { type: 'spring', stiffness: 340, damping: 32 } as const;
  protected readonly overlayTransition = { duration: 0.2, ease: 'easeOut' } as const;
  protected readonly iconTransition = { duration: 0.2, ease: 'easeOut' } as const;

  // @HostListener('window:scroll')
  // onScroll() {
  //   this.isScrolled.set(window.scrollY > 20);
  // }

  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
    this.toggleBodyScroll();
  }

  closeSidebar() {
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
