import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTimePipe',
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date, lang = 'ar'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000);

    // Define time thresholds in seconds
    const units: { unit: Intl.RelativeTimeFormatUnit; amount: number }[] = [
      { unit: 'year', amount: 31536000 },
      { unit: 'month', amount: 2592000 },
      { unit: 'day', amount: 86400 },
      { unit: 'hour', amount: 3600 },
      { unit: 'minute', amount: 60 },
      { unit: 'second', amount: 1 }
    ];

    // Find the right unit to display
    for (const { unit, amount } of units) {
      if (Math.abs(diffInSeconds) >= amount || unit === 'second') {
        const value = Math.round(diffInSeconds / amount);

        // Native browser formatting handles all Arabic grammar rules natively!
        const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
        return rtf.format(value, unit);
      }
    }

    return '';
  }
}
