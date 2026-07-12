import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    const raw = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
    // Strip any Latin letters that might sneak in from mixed-language names.
    return raw.replace(/[a-zA-Z]/g, '');
  }
}
