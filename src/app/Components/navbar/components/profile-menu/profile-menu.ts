import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/Services/auth';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleArrowOutUpRight } from '@ng-icons/lucide';
import {
  bootstrapChevronDown,
  bootstrapCreditCard,
  bootstrapPerson,
} from '@ng-icons/bootstrap-icons';
interface ProfileLink {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-profile-menu',
  imports: [RouterLink, NgIcon],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
  viewProviders: [
    provideIcons({
      lucideCircleArrowOutUpRight,
      bootstrapChevronDown,
      bootstrapPerson,
      bootstrapCreditCard,
    }),
  ],
})
export class ProfileMenu {
  //injections
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  //properties
  readonly isSidebar = input<boolean>(false);
  protected readonly isOpen = signal(false);
  protected readonly isExpanded = signal(false);
  public readonly email = computed(() => this.authService.email());
  public readonly name = computed(() => this.authService.name());
  public readonly links = signal<ProfileLink[]>([
    { label: 'الملف الشخصي', path: '/profile', icon: 'bootstrapPerson' },
    { label: 'سجل المدفوعات', path: '/subscriptions', icon: 'bootstrapCreditCard' },
    // { label: 'الإعدادات',   path: '/settings',  icon: '' },
  ]);

  public readonly initial = computed(() => this.authService.name().at(0));

  toggleDropdown() {
    this.isOpen.update((v) => !v);
  }

  toggleAccordion() {
    this.isExpanded.update((v) => !v);
  }

  logout() {
    this.isOpen.set(false);
    this.authService.logout();
  }
}
