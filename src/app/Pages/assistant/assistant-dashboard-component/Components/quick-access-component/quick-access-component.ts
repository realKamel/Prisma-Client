import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickAccessItem } from '../../../../../core/Models/Assistant/assistant-dashboard.model';

@Component({
  selector: 'app-quick-access',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-access-component.html',
})
export class QuickAccessComponent {
  @Input() items: QuickAccessItem[] = [];

  iconBgStyle(item: QuickAccessItem): string {
    // If colorVar is --accent-rgb (CSS var ref), use it; otherwise it's a raw rgb triplet
    const isVar = item.colorVar.startsWith('--');
    const color = isVar ? `var(${item.colorVar})` : item.colorVar;
    return isVar
      ? `background: rgba(var(${item.colorVar}), 0.16);`
      : `background: rgba(${item.colorVar}, 0.16);`;
  }

  iconColorStyle(item: QuickAccessItem): string {
    return `color: var(${item.iconColorVar});`;
  }
}