import { Component, input } from '@angular/core';
import {
  bootstrapJournalText,
  bootstrapLayersFill,
  bootstrapPeopleFill,
  bootstrapSendFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

import { QuickAccessItem } from '../../../../../core/models/assistant/assistant-dashboard.model';

@Component({
  selector: 'app-quick-access',
  imports: [NgIcon],
  templateUrl: './quick-access-component.html',
  viewProviders: [
    provideIcons({
      bootstrapPeopleFill,
      bootstrapSendFill,
      bootstrapLayersFill,
      bootstrapJournalText,
    }),
  ],
})
export class QuickAccessComponent {
  readonly items = input<QuickAccessItem[]>([]);

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
