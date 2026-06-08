import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  label: string;
  path:  string;
  fragment?: string;
}

const GUEST_LINKS: NavLink[] = [
  { label: 'الدروس',      path: '/lessons' },
  { label: 'كيف تشترك؟',  path: '/', fragment:"how"},
  { label: 'تواصل معنا',  path: '/contact-us' },
];

const AUTH_LINKS: NavLink[] = [
  { label: 'الرئيسية', path: '/home' },
  { label: 'الدروس',   path: '/lessons'   },
  { label: 'السجل',    path: '/history'   },
  { label: ' الإختبارات', path: '/quizzes' },
];

@Component({
  selector: 'app-nav-links',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-links.html',
  styleUrl: './nav-links.css',
})
export class NavLinks {
  @Input() isLoggedIn = false;

  get links(): NavLink[] {
    return this.isLoggedIn ? AUTH_LINKS : GUEST_LINKS;
  }
}
