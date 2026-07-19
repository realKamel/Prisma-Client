import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lessons-header',
  imports:[DecimalPipe],
  templateUrl: './lessons-header.component.html',
})
export class LessonsHeaderComponent {
  total = input.required<number>();
  activeCount = input.required<number>();
  draftedCount = input.required<number>();
  hiddenCount = input.required<number>();
}
