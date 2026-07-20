import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionType, LogEntry } from '../../../../../core/Models/Assistant/log.model';

export type FilterKey = 'all' | ActionType;

interface Chip {
  key: FilterKey;
  label: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-filter-chips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-chips.component.html',
})
export class FilterChipsComponent implements OnChanges {
  @Input() logs: LogEntry[] = [];
  @Input() activeFilter: FilterKey = 'all';
  @Output() filterChange = new EventEmitter<FilterKey>();

  chips: Chip[] = [];

  ngOnChanges(): void {
    this.chips = [
      { key: 'all',    label: 'الكل',  icon: 'bi-grid-3x3-gap', count: this.logs.length },
      { key: 'grant',  label: 'منح',   icon: 'bi-check2-circle', count: this.logs.filter(l => l.type === 'grant').length },
      { key: 'revoke', label: 'إلغاء', icon: 'bi-x-circle',      count: this.logs.filter(l => l.type === 'revoke').length },
      { key: 'view',   label: 'عرض',   icon: 'bi-eye',           count: this.logs.filter(l => l.type === 'view').length },
      { key: 'search', label: 'بحث',   icon: 'bi-search',        count: this.logs.filter(l => l.type === 'search').length },
    ];
  }

  select(key: FilterKey): void {
    this.filterChange.emit(key);
  }
}
