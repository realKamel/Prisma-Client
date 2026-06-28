import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ColorSwatch {
  key: string;
  nameAr: string;
  hex: string;
  rgb: string;
  isDefault?: boolean;
}

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-picker.html',
})
export class ColorPickerComponent implements OnInit {
  readonly COLOR_KEY = 'foundry-accent';

  swatches: ColorSwatch[] = [
    { key: 'purple', nameAr: 'البنفسجي', hex: '#60519b', rgb: '96,81,155', isDefault: true },
    { key: 'teal',   nameAr: 'الفيروزي', hex: '#0d9e8a', rgb: '13,158,138' },
    { key: 'blue',   nameAr: 'الأزرق',   hex: '#3b7fd4', rgb: '59,127,212' },
  ];

  selected = 'purple';
  saving   = false;
  saved    = false;

  ngOnInit() {
    this.selected = localStorage.getItem(this.COLOR_KEY) || 'purple';
  }

  select(key: string) {
    this.selected = key;
    this.saved = false;
  }

  save() {
    this.saving = true;
    setTimeout(() => {
      localStorage.setItem(this.COLOR_KEY, this.selected);
      this.saving = false;
      this.saved  = true;
      setTimeout(() => (this.saved = false), 2400);
    }, 1200);
  }
}