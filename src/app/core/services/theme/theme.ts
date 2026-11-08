import { DOCUMENT } from '@angular/common';
import { effect, inject, Service, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

@Service()
export class ThemeService {
  private document = inject(DOCUMENT);

  readonly theme = signal<Theme>((localStorage.getItem('wasla-theme') as Theme) || 'dark');

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('wasla-theme', this.theme());
    });
  }

  public toggle() {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }
}
