import { Component, input, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  label: string;
  path: string;
  fragment?: string;
}

@Component({
  selector: 'app-nav-links',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-links.html',
  styleUrl: './nav-links.css',
})
export class NavLinks {
  public isLoggedIn = input.required<boolean>();

  private readonly GUEST_LINKS: NavLink[] = [
    { label: 'الدروس', path: '/lessons' },
    { label: 'كيف تشترك؟', path: '/', fragment: 'how' },
    { label: 'تواصل معنا', path: '/contact-us' },
  ];

  private readonly AUTH_LINKS: NavLink[] = [
    { label: 'الرئيسية', path: '/home' },
    { label: 'الدروس', path: '/lessons' },
    { label: 'السجل', path: '/history' },
    { label: ' الإختبارات', path: '/quizzes' },
  ];
  protected readonly links = computed(() => {
    return this.isLoggedIn() ? this.AUTH_LINKS : this.GUEST_LINKS;
  });
}
