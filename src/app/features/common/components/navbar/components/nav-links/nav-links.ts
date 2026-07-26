import { Component, inject, input, computed, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../core/Services/language';
import { NavLink } from '../../../../../../core/Models/Common/navigation.model';

@Component({
  selector: 'app-nav-links',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-links.html',
  styleUrl: './nav-links.css',
})
export class NavLinks {
  public isLoggedIn = input.required<boolean>();
  private readonly translate = inject(TranslateService);
  private readonly langService = inject(LanguageService);
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

  protected readonly links = computed(() => {
    // React to lang changes
    this.langService.lang();
    const items = this.isLoggedIn() ? this.AUTH_LINKS : this.GUEST_LINKS;
    return items.map((item) => ({ ...item, label: this.translate.instant(item.labelKey) }));
  });
}
