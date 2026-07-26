import { inject, Service, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'ar' | 'en';

@Service()
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly translateService = inject(TranslateService);

  readonly lang = signal<Lang>(
    (typeof window !== 'undefined' ? (localStorage.getItem('lang') as Lang) : null) ?? 'ar',
  );

  toggle(): void {
    const next = this.lang() === 'ar' ? 'en' : ('ar' as Lang);
    this.applyLang(next);
  }

  setLang(l: Lang): void {
    this.applyLang(l);
  }

  private applyLang(l: Lang): void {
    this.lang.set(l);
    localStorage.setItem('lang', l);
    this.document.documentElement.setAttribute('lang', l);
    this.document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
    this.translateService.use(l);
  }
}
