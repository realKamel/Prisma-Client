import { Component, inject, OnInit, signal, computed } from '@angular/core';

import { FilterKey } from './components/filter-chips/filter-chips.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { FilterChipsComponent } from './components/filter-chips/filter-chips.component';
import { LogTableComponent } from './components/log-table/log-table.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { LogEntry, LogMeta } from '../../../core/Models/Assistant/log.model';
import { LogService } from '../../../core/Services/log.service';
import { KpiStripComponent } from './components/kpi-strip/kpi-strip.component';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowRepeat,
  bootstrapExclamationCircle,
  bootstrapChevronRight,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-log-page-component',
  imports: [
    RouterLink,
    PageHeaderComponent,
    KpiStripComponent,
    FilterChipsComponent,
    LogTableComponent,
    PaginationComponent,
    EmptyStateComponent,
    NgIcon,
  ],
  templateUrl: './log-page-component.html',
  viewProviders: [
    provideIcons({
      bootstrapArrowRepeat,
      bootstrapExclamationCircle,
      bootstrapChevronRight,
    }),
  ],
})
export class LogPageComponent implements OnInit {
  private logService = inject(LogService);

  loading = signal(true);
  error = signal(false);

  protected readonly allLogs = signal<LogEntry[]>([]);
  protected readonly meta = signal<LogMeta>({
    totalThisMonth: 0,
    granted: 0,
    revoked: 0,
    successRate: 0,
  });

  protected readonly activeFilter = signal<FilterKey>('all');
  protected readonly currentPage = signal(1);
  readonly perPage = signal(8);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // this.loading = true;
    // this.error = false;
    this.loading.set(true);
    this.error.set(false);
    this.logService.getLogs(15).subscribe({
      next: (res) => {
        this.allLogs.set(res.logs);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        // this.error = true;
        this.error.set(true);
        // this.loading = false;
        this.loading.set(false);
        // this.cdr.detectChanges();
      },
    });
  }

  protected readonly filteredLogs = computed(() => {
    if (this.activeFilter() === 'all') return this.allLogs();
    return this.allLogs().filter((l) => l.type === this.activeFilter());
  });

  protected readonly pagedLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.perPage();
    return this.filteredLogs().slice(start, start + this.perPage());
  });

  onFilterChange(filter: FilterKey): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }
}
