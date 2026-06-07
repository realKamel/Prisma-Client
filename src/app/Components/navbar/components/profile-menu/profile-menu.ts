import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  @Input() name = '';
  @Input() email = '';
  @Input() isSidebar: boolean = false

  isOpen = signal(false);
  readonly isExpanded = signal(false);

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
    // هنا هنضيف الـ AuthService لاحقاً
    console.log('logout');
  }
}
