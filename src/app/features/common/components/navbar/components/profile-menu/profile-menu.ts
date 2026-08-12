import { Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleArrowOutUpRight } from '@ng-icons/lucide';
import {
  bootstrapChevronDown,
  bootstrapCreditCard,
  bootstrapPerson,
} from '@ng-icons/bootstrap-icons';
import { ProfileLink } from '../../../../../../core/Models/Common/navigation.model';
import { AuthStoreService } from '../../../../../../core/Services/auth-store.service';

@Component({
  selector: 'app-profile-menu',
  imports: [RouterLink, NgIcon, TranslatePipe],
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
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeMenus()',
  },
})
export class ProfileMenu {
  //injections
  protected readonly authService = inject(AuthStoreService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

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
  public readonly links = computed(() => this.linkDefs);

  public readonly initial = computed(() => this.authService.name().at(0));

  toggleDropdown() {
    this.isOpen.update((v) => !v);
  }

  toggleAccordion() {
    this.isExpanded.update((v) => !v);
  }

  onDocumentClick(event: Event) {
    const target = event.target as Node;
    if (!this.host.nativeElement.contains(target)) {
      this.closeMenus();
    }
  }

  closeMenus() {
    this.isOpen.set(false);
    this.isExpanded.set(false);
  }

  logout() {
    this.closeMenus();
    this.authService.logout();
  }
}
