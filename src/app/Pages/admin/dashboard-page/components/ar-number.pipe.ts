import { Pipe, PipeTransform } from '@angular/core';
import { toAr } from './ar-digits.util';

@Pipe({
  name: 'arNumber',
  standalone: true,
})
export class ArNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return toAr(value);
  }
}
