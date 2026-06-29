import { Component, OnInit, computed, signal } from '@angular/core';
import { LogPageHeaderComponent } from './components/log-page-header/log-page-header.component';
import { KpiStripComponent } from './components/kpi-strip/kpi-strip.component';
import { LogToolbarComponent } from './components/log-toolbar/log-toolbar.component';
import { FilterChipsComponent } from './components/filter-chips/filter-chips.component';
import { LogTableComponent } from './components/log-table/log-table.component';
import { LogPaginationComponent } from './components/log-pagination/log-pagination.component';
import { ActorRole, ActivityEvent, ActivityLogStats, RoleFilter } from '../../../core/Models/Admin/activity-log.model';
import { ActivityLogService } from '../../../core/Services/activity-log.service';

const PAGE_SIZE = 8;
const ROLES: ActorRole[] = ['teacher', 'assistant', 'student', 'admin', 'system'];

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [
    LogPageHeaderComponent,
    KpiStripComponent,
    LogToolbarComponent,
    FilterChipsComponent,
    LogTableComponent,
    LogPaginationComponent,
  ],
  templateUrl: './activity-log.component.html',
})
export class ActivityLogComponent implements OnInit {
  private readonly allEvents = signal<ActivityEvent[]>([]);

  readonly stats = signal<ActivityLogStats | null>(null);
  readonly activeFilter = signal<RoleFilter>('all');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);

  readonly filteredEvents = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return this.allEvents().filter((ev) => {
      const matchesRole = filter === 'all' || ev.role === filter;
      const matchesSearch =
        !query || ev.user.toLowerCase().includes(query) || ev.action.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredEvents().length / PAGE_SIZE)));

  readonly pagedEvents = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filteredEvents().slice(start, start + PAGE_SIZE);
  });

  readonly chipCounts = computed(() => {
    const events = this.allEvents();
    const counts: Record<RoleFilter, number> = {
      all: events.length,
      teacher: 0,
      assistant: 0,
      student: 0,
      admin: 0,
      system: 0,
    };
    for (const role of ROLES) {
      counts[role] = events.filter((ev) => ev.role === role).length;
    }
    return counts;
  });

  constructor(private readonly activityLogService: ActivityLogService) {}

  ngOnInit(): void {
    this.activityLogService.getActivityLog().subscribe((res) => {
      this.stats.set(res.stats);
      this.allEvents.set(res.events);
    });
  }

  onFilterChange(filter: RoleFilter): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }
}
