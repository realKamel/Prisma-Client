import { Pipe, PipeTransform } from '@angular/core';
import { toAr } from './to-ar (1)';

/**
 * Formats an ISO date string as an Arabic-Indic 'YYYY/MM/DD' string.
 * Usage: {{ transaction.date | arDate }}
 */
@Pipe({
  name: 'arDate',
  standalone: true,
})
export class ArDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return toAr(`${year}/${month}/${day}`);
  }
}
