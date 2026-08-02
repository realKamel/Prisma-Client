import { Component, computed, DOCUMENT, inject, model } from '@angular/core';
import { NavLogo } from './components/nav-logo/nav-logo';
import { ThemeToggle } from './components/theme-toggle/theme-toggle';
import { NavLinks } from './components/nav-links/nav-links';
import { AuthButtons } from './components/auth-buttons/auth-buttons';
import { ProfileMenu } from './components/profile-menu/profile-menu';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/Services/auth';
import { LanguageService } from '../../../../core/Services/language';

@Component({
  selector: 'app-navbar',
  imports: [NavLogo, ThemeToggle, NavLinks, AuthButtons, ProfileMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly document = inject(DOCUMENT);
  private readonly authService = inject(AuthService);
  protected readonly langService = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  // isScrolled    = signal(false);
  protected readonly isSidebarOpen = model(false);

  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly userName = computed(() => this.authService.name());
  protected readonly userEmail = computed(() => this.authService.email());

  /** Make template reactive to lang changes */
  private readonly _ = computed(() => this.langService.lang());

  protected readonly menuLabel = computed(() => {
    this._();
    return this.translate.instant('NAVBAR.MENU');
  });
  protected readonly closeLabel = computed(() => {
    this._();
    return this.translate.instant('NAVBAR.CLOSE');
  });
  protected readonly langToggleAria = computed(() => {
    this._();
    return this.langService.lang() === 'ar'
      ? this.translate.instant('SIDEBAR.ENGLISH')
      : this.translate.instant('SIDEBAR.ARABIC');
  });
  protected readonly langToggleText = computed(() =>
    this.langService.lang() === 'ar' ? 'ع' : 'E',
  );
  protected readonly langToggleLabel = computed(() => {
    this._();
    return this.langService.lang() === 'ar'
      ? this.translate.instant('SIDEBAR.ENGLISH')
      : this.translate.instant('SIDEBAR.ARABIC');
  });

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
