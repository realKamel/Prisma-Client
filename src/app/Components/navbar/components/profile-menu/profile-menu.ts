import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/Services/auth';
interface ProfileLink {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-profile-menu',
  imports: [RouterLink],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
})
export class ProfileMenu {
  //injections
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  //properties
  readonly isSidebar = input<boolean>(false);
  readonly isOpen = signal(false);
  readonly isExpanded = signal(false);
  public readonly email = computed(() => this.authService.email());
  public readonly name = computed(() => this.authService.name());
  public readonly links: ProfileLink[] = [
    { label: 'الملف الشخصي', path: '/profile', icon: 'bi bi-person' },
    { label: 'سجل المدفوعات', path: '/subscriptions', icon: 'bi bi-credit-card' },
    // { label: 'الإعدادات',   path: '/settings',  icon: '' },
  ];

  public readonly initial = computed(() => this.authService.name().at(0));

  toggleDropdown() {
    this.isOpen.update((v) => !v);
  }

  toggleAccordion() {
    this.isExpanded.update((v) => !v);
  }

  logout() {
    this.isOpen.set(false);
    this.authService.logout().subscribe();
    this.router.navigate(['/home']);
  }
}
