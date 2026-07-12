import { Component, OnInit, computed, signal } from '@angular/core';
import { LogPageHeaderComponent } from './components/log-page-header/log-page-header.component';
import { KpiStripComponent } from './components/kpi-strip/kpi-strip.component';
import { LogToolbarComponent } from './components/log-toolbar/log-toolbar.component';
import { FilterChipsComponent } from './components/filter-chips/filter-chips.component';
import { LogTableComponent } from './components/log-table/log-table.component';
import { ActorRole, ActivityEvent, ActivityLogStats, RoleFilter } from '../../../core/Models/Admin/activity-log.model';
import { ActivityLogService } from '../../../core/Services/activity-log.service';

const PAGE_SIZE = 20;
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
  ],
  templateUrl: './activity-log.component.html',
})
export class ActivityLogComponent implements OnInit {
  private readonly allEvents = signal<ActivityEvent[]>([]);
  private currentSkip = 0;

  readonly stats = signal<ActivityLogStats | null>(null);
  readonly activeFilter = signal<RoleFilter>('all');
  readonly searchQuery = signal('');
  readonly hasMore = signal(false);
  readonly loadingInitial = signal(true);
  readonly loadingMore = signal(false);

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
    this.loadInitial();
  }

  private loadInitial(): void {
    this.loadingInitial.set(true);
    this.currentSkip = 0;

    this.activityLogService.getActivityLog(0, PAGE_SIZE).subscribe({
      next: (res) => {
        if (res.stats) this.stats.set(res.stats);
        this.allEvents.set(res.events);
        this.hasMore.set(res.hasMore);
        this.currentSkip = res.events.length;
        this.loadingInitial.set(false);
      },
      error: () => this.loadingInitial.set(false),
    });
  }

  onLoadMore(): void {
    if (this.loadingMore() || !this.hasMore()) return;

    this.loadingMore.set(true);
    this.activityLogService.getActivityLog(this.currentSkip, PAGE_SIZE).subscribe({
      next: (res) => {
        this.allEvents.set([...this.allEvents(), ...res.events]);
        this.hasMore.set(res.hasMore);
        this.currentSkip += res.events.length;
        this.loadingMore.set(false);
      },
      error: () => this.loadingMore.set(false),
    });
  }

  onFilterChange(filter: RoleFilter): void {
    this.activeFilter.set(filter);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }
}