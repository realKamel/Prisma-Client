import { Component, computed, DOCUMENT, inject, model } from '@angular/core';
import { NavLogoComponent } from './components/nav-logo/nav-logo';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle';
import { NavLinksComponent } from './components/nav-links/nav-links';
import { AuthButtons } from './components/auth-buttons/auth-buttons';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/Services/auth';
import { LanguageService } from '../../../../core/Services/language';

@Component({
  selector: 'app-navbar',
  imports: [
    NavLogoComponent,
    ThemeToggleComponent,
    NavLinksComponent,
    AuthButtons,
    ProfileMenuComponent,
    TranslatePipe,
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
