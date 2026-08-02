import { Component, input, computed, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NavLink } from '../../../../../../core/Models/Common/navigation.model';

@Component({
  selector: 'app-nav-links',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './nav-links.html',
  styleUrl: './nav-links.css',
})
export class NavLinks {
  public isLoggedIn = input.required<boolean>();
  public readonly isSideBarOpen = model<boolean>();
  private readonly GUEST_LINKS: NavLink[] = [
    { labelKey: 'NAVBAR.LESSONS', path: '/lessons' },
    { labelKey: 'NAVBAR.HOW_TO_SUBSCRIBE', path: '/', fragment: 'how' },
    { labelKey: 'NAVBAR.CONTACT_US', path: '/contact-us' },
  ];

  private readonly AUTH_LINKS: NavLink[] = [
    { labelKey: 'NAVBAR.HOME', path: '/home' },
    { labelKey: 'NAVBAR.LESSONS', path: '/lessons' },
    { labelKey: 'NAVBAR.HISTORY', path: '/history' },
    { labelKey: 'NAVBAR.QUIZZES', path: '/quizzes' },
  ];

  protected readonly links = computed(() =>
    this.isLoggedIn() ? this.AUTH_LINKS : this.GUEST_LINKS,
  );
}
