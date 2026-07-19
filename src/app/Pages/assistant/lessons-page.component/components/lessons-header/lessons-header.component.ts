import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lessons-header',

  templateUrl: './lessons-header.component.html',
})
export class LessonsHeaderComponent {
  total = input.required<number>();
  activeCount = input.required<number>();
  draftedCount = input.required<number>();
  hiddenCount = input.required<number>();

  // TODO: swap for the shared ArNumberPipe / toAr() util once wired into this feature.
  toAr(value: number): string {
    return String(value).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }
}
