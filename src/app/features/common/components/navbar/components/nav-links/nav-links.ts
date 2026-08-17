import { Component, input, computed, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleHelp,
  lucideClipboardList,
  lucideHistory,
  lucideHome,
  lucideMail,
  lucideUsers,
} from '@ng-icons/lucide';
import { NavLink } from '../../../../../../core/Models/Common/navigation.model';

@Component({
  selector: 'app-nav-links',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, NgIcon],
  templateUrl: './nav-links.html',
  styleUrl: './nav-links.css',
  viewProviders: [
    provideIcons({
      lucideCircleHelp,
      lucideClipboardList,
      lucideHistory,
      lucideHome,
      lucideMail,
      lucideUsers,
    }),
  ],
})
export class NavLinks {
  public isLoggedIn = input.required<boolean>();
  public readonly isSideBarOpen = model<boolean>();
  private readonly GUEST_LINKS: NavLink[] = [
    // { labelKey: 'NAVBAR.LESSONS', path: '/lessons', icon: 'lucideBookOpen' },
    { labelKey: 'NAVBAR.TEACHERS', path: '/teachers', icon: 'lucideUsers' },
    { labelKey: 'NAVBAR.HOW_TO_SUBSCRIBE', path: '/', fragment: 'how', icon: 'lucideCircleHelp' },
    { labelKey: 'NAVBAR.CONTACT_US', path: '/contact-us', icon: 'lucideMail' },
  ];

  private readonly AUTH_LINKS: NavLink[] = [
    { labelKey: 'NAVBAR.HOME', path: '/home', icon: 'lucideHome' },
    // { labelKey: 'NAVBAR.LESSONS', path: '/lessons', icon: 'lucideBookOpen' },
    { labelKey: 'NAVBAR.TEACHERS', path: '/teachers', icon: 'lucideUsers' },
    { labelKey: 'NAVBAR.HISTORY', path: '/history', icon: 'lucideHistory' },
    { labelKey: 'NAVBAR.QUIZZES', path: '/quizzes', icon: 'lucideClipboardList' },
  ];

  protected readonly links = computed(() =>
    this.isLoggedIn() ? this.AUTH_LINKS : this.GUEST_LINKS,
  );
}
