import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import {
  bootstrapArrowRepeat,
  bootstrapChevronRight,
  bootstrapExclamationCircle,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { LogEntry, LogMeta } from '../../../core/Models/Assistant/log.model';
import { LogService } from '../../../core/Services/log.service';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { FilterChipsComponent, FilterKey } from './components/filter-chips/filter-chips.component';
import { KpiStripComponent } from './components/kpi-strip/kpi-strip.component';
import { LogTableComponent } from './components/log-table/log-table.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PaginationComponent } from './components/pagination/pagination.component';

@Component({
  selector: 'app-log-page-component',
  imports: [
    PageHeaderComponent,
    KpiStripComponent,
    FilterChipsComponent,
    LogTableComponent,
    PaginationComponent,
    EmptyStateComponent,
    NgIcon,
    NgmMotionDirective,
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

  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly allLogs = signal<LogEntry[]>([]);
  protected readonly meta = signal<LogMeta>({
    totalThisMonth: 0,
    granted: 0,
    revoked: 0,
    successRate: 0,
  });

  protected readonly activeFilter = signal<FilterKey>('all');
  protected readonly currentPage = signal(1);
  protected readonly perPage = signal(8);

  constructor() {
    // Reset to first page whenever the filter changes
    effect(() => {
      this.activeFilter();
      this.currentPage.set(1);
    });
  }

  public ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.error.set(false);
    this.logService.getLogs(15).subscribe({
      next: (res) => {
        this.allLogs.set(res.logs);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
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

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }
}
