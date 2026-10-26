import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);
  public transform(
    value: number | null | undefined,
    format: 'digital' | 'human' = 'digital',
    overrideLocale?: string,
  ): string {
    if (value === null || value === undefined || isNaN(value) || value < 0) {
      return '00:00';
    }

    const totalSeconds = Math.floor(value);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const targetLocale = overrideLocale || this.locale;

    // Option A: Human-readable localized format using Intl API
    if (format === 'human') {
      // Modern Intl.DurationFormat standard (falling back gracefully)
      if ('DurationFormat' in Intl) {
        const duration: Record<string, number> = {};
        if (days > 0) duration['days'] = days;
        if (hours > 0) duration['hours'] = hours;
        if (minutes > 0) duration['minutes'] = minutes;
        if (seconds > 0 || Object.keys(duration).length === 0) duration['seconds'] = seconds;

        return new (Intl as any).DurationFormat(targetLocale, { style: 'short' }).format(duration);
      }

      // Fallback: Custom localized unit formatting via Intl.NumberFormat
      const parts: string[] = [];

      if (days > 0) {
        parts.push(
          new Intl.NumberFormat(targetLocale, {
            style: 'unit',
            unit: 'day',
            unitDisplay: 'narrow',
          }).format(days),
        );
      }
      if (hours > 0) {
        parts.push(
          new Intl.NumberFormat(targetLocale, {
            style: 'unit',
            unit: 'hour',
            unitDisplay: 'narrow',
          }).format(hours),
        );
      }
      if (minutes > 0) {
        parts.push(
          new Intl.NumberFormat(targetLocale, {
            style: 'unit',
            unit: 'minute',
            unitDisplay: 'narrow',
          }).format(minutes),
        );
      }
      if (seconds > 0 || parts.length === 0) {
        parts.push(
          new Intl.NumberFormat(targetLocale, {
            style: 'unit',
            unit: 'second',
            unitDisplay: 'narrow',
          }).format(seconds),
        );
      }

      return parts.join(' ');
    }

    // Option B: Digital format (DD:HH:MM:SS, HH:MM:SS, or MM:SS)
    const nf = new Intl.NumberFormat(targetLocale, { minimumIntegerDigits: 2, useGrouping: false });

    if (days > 0) {
      return `${nf.format(days)}:${nf.format(hours)}:${nf.format(minutes)}:${nf.format(seconds)}`;
    }
    if (hours > 0) {
      return `${nf.format(hours)}:${nf.format(minutes)}:${nf.format(seconds)}`;
    }
    return `${nf.format(minutes)}:${nf.format(seconds)}`;
  }
}
