import { Component, computed, input, model } from '@angular/core';
import {
  bootstrapCheck2Circle,
  bootstrapEye,
  bootstrapGrid3x3Gap,
  bootstrapSearch,
  bootstrapXCircle,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { Chip } from '../../../../../core/models/assistant/activity-ui.model';
import { ActionType, LogEntry } from '../../../../../core/models/assistant/log.model';

export type FilterKey = 'all' | ActionType;

@Component({
  selector: 'app-filter-chips',
  imports: [NgIcon, NgmMotionDirective],
  templateUrl: './filter-chips.component.html',
  viewProviders: [
    provideIcons({
      bootstrapGrid3x3Gap,
      bootstrapCheck2Circle,
      bootstrapXCircle,
      bootstrapEye,
      bootstrapSearch,
    }),
  ],
})
export class FilterChipsComponent {
  readonly logs = input<LogEntry[]>([]);
  readonly activeFilter = model<FilterKey>('all');

  readonly chips = computed<Chip<FilterKey>[]>(() => [
    { key: 'all', label: 'الكل', icon: 'bootstrapGrid3x3Gap', count: this.logs().length },
    {
      key: 'grant',
      label: 'منح',
      icon: 'bootstrapCheck2Circle',
      count: this.logs().filter((l) => l.type === 'grant').length,
    },
    {
      key: 'revoke',
      label: 'إلغاء',
      icon: 'bootstrapXCircle',
      count: this.logs().filter((l) => l.type === 'revoke').length,
    },
    {
      key: 'view',
      label: 'عرض',
      icon: 'bootstrapEye',
      count: this.logs().filter((l) => l.type === 'view').length,
    },
    {
      key: 'search',
      label: 'بحث',
      icon: 'bootstrapSearch',
      count: this.logs().filter((l) => l.type === 'search').length,
    },
  ]);

  select(key: FilterKey): void {
    this.activeFilter.set(key);
  }
}
