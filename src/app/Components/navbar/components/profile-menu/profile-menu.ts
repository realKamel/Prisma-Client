import { assertInInjectionContext, Component, inject, Input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/Services/auth';
interface ProfileLink {
  label: string;
  path: string;
  icon: string;
}

const PROFILE_LINKS: ProfileLink[] = [
  { label: 'الملف الشخصي', path: '/profile', icon: 'bi bi-person' },
  { label: 'سجل المدفوعات', path: '/subscriptions', icon: 'bi bi-credit-card' },
  // { label: 'الإعدادات',   path: '/settings',  icon: '' },
];

@Component({
  selector: 'app-profile-menu',
  imports: [RouterLink],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
})
export class ProfileMenu {
  private authService = inject(AuthService);
  private router=inject( Router);
  @Input() isSidebar: boolean = false
  isOpen = signal(false);
  readonly isExpanded = signal(false);
  @Input() email = this.authService.email();
  @Input() name = this.authService.name();
  
  links = PROFILE_LINKS;

  get initial(): string {
    return this.name ? this.name.charAt(0) : 'محمد';
  }

  toggleDropdown() {
    this.isOpen.update((v) => !v);
  }

  toggleAccordion() {
  this.isExpanded.update(v => !v);
}

  logout() {
    this.isOpen.set(false);
    this.authService.logout();
    this.authService.logoutAccount()
    this.router.navigate(['/login']); 
  }
}
