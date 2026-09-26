import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
})
export class RelativeTimePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  public transform(
    value: Date | string | number | null | undefined,
    overrideLang?: string,
  ): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

    // Fallback/sanitize locale code (e.g., convert 'en-US' or 'es-ES' if needed, though Intl accepts standard BCP 47 tags)
    const activeLocale = overrideLang || this.locale || 'en';

    // Native browser i18n formatter initialized with Angular's injected locale
    const rtf = new Intl.RelativeTimeFormat(activeLocale, { numeric: 'auto' });

    const days = Math.round(diffInSeconds / 86400);

    if (Math.abs(days) >= 365) {
      return rtf.format(Math.round(days / 365), 'year');
    }
    if (Math.abs(days) >= 30) {
      return rtf.format(Math.round(days / 30), 'month');
    }
    if (Math.abs(days) >= 1) {
      return rtf.format(days, 'day');
    }

    const hours = Math.round(diffInSeconds / 3600);
    if (Math.abs(hours) >= 1) {
      return rtf.format(hours, 'hour');
    }

    const minutes = Math.round(diffInSeconds / 60);
    if (Math.abs(minutes) >= 1) {
      return rtf.format(minutes, 'minute');
    }

    return rtf.format(diffInSeconds, 'second');
  }
}
