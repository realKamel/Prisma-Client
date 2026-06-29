import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'arabicNumerals', standalone: true })
export class ArabicNumeralsPipe implements PipeTransform {
  private readonly digits = '٠١٢٣٤٥٦٧٨٩';

  transform(value: number | string): string {
    return String(value).replace(/\d/g, (d) => this.digits[+d]);
  }
}
