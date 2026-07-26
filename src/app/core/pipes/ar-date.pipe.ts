import { Pipe, PipeTransform, inject, LOCALE_ID } from '@angular/core';

/**
 * Formats an ISO date string as a locale-aware 'YYYY/MM/DD' string.
 * Digits follow the current language setting (Arabic-Indic for ar, Western for en).
 * Uses Intl.NumberFormat which respects LOCALE_ID.
 * Usage: {{ transaction.date | arDate }}
 */
@Pipe({
  name: 'arDate',
  standalone: true,
})
export class ArDatePipe implements PipeTransform {
  private readonly nf = new Intl.NumberFormat(inject(LOCALE_ID));

  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${this.nf.format(year)}/${this.nf.format(Number(month))}/${this.nf.format(Number(day))}`;
  }
}
