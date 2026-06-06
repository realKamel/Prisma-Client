import { effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';


export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private document = inject(DOCUMENT);

  theme = signal<Theme>(
    (localStorage.getItem('foundry-theme') as Theme) || 'dark'
  );

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('foundry-theme', this.theme());
    });
  }

  toggle() {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }
}
