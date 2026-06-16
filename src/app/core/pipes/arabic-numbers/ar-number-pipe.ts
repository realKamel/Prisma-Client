import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arNumber',
})
export class ArNumberPipe implements PipeTransform {
  transform(value: number | string | undefined | null): string {
    if (value === undefined || value === null) return '';
    return String(value).replace(/[0-9]/g, (match: string) => {
      const index = parseInt(match, 10);
      return '٠١٢٣٤٥٦٧٨٩'[index];
    });
  }
}
