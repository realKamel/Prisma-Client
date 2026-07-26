import { Component, OnChanges, output, input } from '@angular/core';

import { ActionType, LogEntry } from '../../../../../core/Models/Assistant/log.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapGrid3x3Gap,
  bootstrapCheck2Circle,
  bootstrapXCircle,
  bootstrapEye,
  bootstrapSearch,
} from '@ng-icons/bootstrap-icons';

import { Chip } from '../../../../../core/Models/Assistant/activity-ui.model';

export type FilterKey = 'all' | ActionType;

@Component({
  selector: 'app-filter-chips',
  imports: [NgIcon],
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
export class FilterChipsComponent implements OnChanges {
  readonly logs = input<LogEntry[]>([]);
  readonly activeFilter = input<FilterKey>('all');
  readonly filterChange = output<FilterKey>();

  chips: Chip<FilterKey>[] = [];

  ngOnChanges(): void {
    this.chips = [
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
    ];
  }

  select(key: FilterKey): void {
    this.filterChange.emit(key);
  }
}
