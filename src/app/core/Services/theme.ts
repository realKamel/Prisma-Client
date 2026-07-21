import { effect, inject, Injectable, Service, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'dark' | 'light';

@Service()
export class ThemeService {
  private document = inject(DOCUMENT);

  readonly theme = signal<Theme>((localStorage.getItem('prisma-theme') as Theme) || 'dark');

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('prisma-theme', this.theme());
    });
  }

  public toggle() {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }
}
