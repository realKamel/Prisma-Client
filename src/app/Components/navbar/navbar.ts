import { Component, DOCUMENT, HostListener, inject, signal } from '@angular/core';
import { NavLogo } from "./components/nav-logo/nav-logo";
import { ThemeToggle } from "./components/theme-toggle/theme-toggle";
import { NavLinks } from "./components/nav-links/nav-links";
import { AuthButtons } from "./components/auth-buttons/auth-buttons";
import { ProfileMenu } from "./components/profile-menu/profile-menu";

@Component({
  selector: 'app-navbar',
  imports: [NavLogo, ThemeToggle, NavLinks, AuthButtons, ProfileMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
private document = inject(DOCUMENT);

  // isScrolled    = signal(false);
  isSidebarOpen = signal(false);

  // ⚠️ مؤقت — هيتغير لما نعمل AuthService
  isLoggedIn  = signal(false);
  userName    = signal('أحمد محمد');
  userEmail   = signal('ahmed@example.com');

  // @HostListener('window:scroll')
  // onScroll() {
  //   this.isScrolled.set(window.scrollY > 20);
  // }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
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
