import { Pipe, PipeTransform } from '@angular/core';
import { toAr } from './to-ar (1)';


/**
 * Renders a number/string with Arabic-Indic numerals.
 * Usage: {{ transaction.amount | arNum }}
 */
@Pipe({
  name: 'arNum',
  standalone: true,
})
export class ArNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return toAr(value);
  }
}
