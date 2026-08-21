import { Component, inject, OnInit, signal } from '@angular/core';
import { AccentService } from '../../../../core/Services/accent-service';
import { AccentColor } from '../../../../core/Models/Accent-color-model';

interface ColorSwatch {
  key: AccentColor;
  nameAr: string;
  hex: string;
  rgb: string;
  isDefault?: boolean;
}

@Component({
  selector: 'app-color-picker',
  imports: [],
  templateUrl: './color-picker.html',
})
export class ColorPickerComponent implements OnInit {
  private accentService = inject(AccentService);

  swatches: ColorSwatch[] = [
    { key: 'Blue', nameAr: 'الأزرق', hex: '#3b7fd4', rgb: '59,127,212', isDefault: true },
    { key: 'Purple', nameAr: 'البنفسجي', hex: '#60519b', rgb: '96,81,155' },
    { key: 'Teal', nameAr: 'الفيروزي', hex: '#0d9e8a', rgb: '13,158,138' },
  ];

  protected readonly selected = signal<AccentColor>('Blue');
  protected readonly saved = signal(false);

  get saving(): boolean {
    return this.accentService.saving();
  }

  ngOnInit() {
    this.selected.set(this.accentService.accent());
  }

  select(key: AccentColor) {
    if (key === this.selected()) return;
    this.selected.set(key);
    this.saved.set(false);
    this.accentService.preview(key); // live preview
  }

  save() {
    this.accentService.save(this.selected()).subscribe((success) => {
      if (success) {
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2400);
      }
    });
  }
}
