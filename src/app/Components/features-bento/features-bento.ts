import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features-bento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-bento.html'
})
export class FeaturesBento {
  selectedQuizOption: string | null = null;
  
  streakDays = [
    { label: 'س', current: false, missed: false },
    { label: 'إ', current: false, missed: false },
    { label: 'ث', current: false, missed: false },
    { label: 'ر', current: false, missed: false },
    { label: 'خ', current: true, missed: false },
    { label: 'ج', current: false, missed: true },
    { label: 'س', current: false, missed: true },
  ];

  selectOption(option: string): void {
    this.selectedQuizOption = option;
  }
}