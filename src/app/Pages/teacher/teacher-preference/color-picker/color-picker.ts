import { Component, inject, OnInit } from '@angular/core';

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
    { key: 'Purple', nameAr: 'البنفسجي', hex: '#60519b', rgb: '96,81,155', isDefault: true },
    { key: 'Teal', nameAr: 'الفيروزي', hex: '#0d9e8a', rgb: '13,158,138' },
    { key: 'Blue', nameAr: 'الأزرق', hex: '#3b7fd4', rgb: '59,127,212' },
  ];

  selected: AccentColor = 'Purple';
  saved = false;

  get saving(): boolean {
    return this.accentService.saving();
  }

  ngOnInit() {
    this.selected = this.accentService.accent();
  }

  select(key: AccentColor) {
    if (key === this.selected) return;
    this.selected = key;
    this.saved = false;
    this.accentService.preview(key); // live preview
  }

  save() {
    this.accentService.save(this.selected).subscribe((success) => {
      if (success) {
        this.saved = true;
        setTimeout(() => (this.saved = false), 2400);
      }
    });
  }
}
