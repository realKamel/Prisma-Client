import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../core/Services/language';
import { AuthService } from '../../../../../../core/Services/auth';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleArrowOutUpRight } from '@ng-icons/lucide';
import {
  bootstrapChevronDown,
  bootstrapCreditCard,
  bootstrapPerson,
} from '@ng-icons/bootstrap-icons';
import { ProfileLink } from '../../../../../../core/Models/Common/navigation.model';

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
  private readonly translate = inject(TranslateService);
  private readonly langService = inject(LanguageService);

  //properties
  readonly isSidebar = input<boolean>(false);
  protected readonly isOpen = signal(false);
  protected readonly isExpanded = signal(false);
  public readonly email = computed(() => this.authService.email());
  public readonly name = computed(() => this.authService.name());
  private readonly linkDefs: ProfileLink[] = [
    { labelKey: 'NAVBAR.PROFILE', path: '/profile', icon: 'bootstrapPerson' },
    { labelKey: 'NAVBAR.PAYMENT_HISTORY', path: '/subscriptions', icon: 'bootstrapCreditCard' },
  ];
  public readonly links = computed(() => {
    this.langService.lang();
    return this.linkDefs.map((item) => ({ ...item, label: this.translate.instant(item.labelKey) }));
  });

  protected readonly logoutLabel = computed(() => {
    this.langService.lang();
    return this.translate.instant('NAVBAR.LOGOUT');
  });

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
