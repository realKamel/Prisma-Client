import { Component, computed, DOCUMENT, HostListener, inject, signal } from '@angular/core';
import { NavLogo } from './components/nav-logo/nav-logo';
import { ThemeToggle } from './components/theme-toggle/theme-toggle';
import { NavLinks } from './components/nav-links/nav-links';
import { AuthButtons } from './components/auth-buttons/auth-buttons';
import { ProfileMenu } from './components/profile-menu/profile-menu';
import { AuthService } from '../../core/Services/auth';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { bootstrapListUl } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-navbar',
  imports: [NavLogo, ThemeToggle, NavLinks, AuthButtons, ProfileMenu, NgIcon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  viewProviders: [provideIcons({ lucideX, bootstrapListUl })],
})
export class Navbar {
  private readonly document = inject(DOCUMENT);
  private readonly authService = inject(AuthService);
  // isScrolled    = signal(false);
  protected readonly isSidebarOpen = signal(false);

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
