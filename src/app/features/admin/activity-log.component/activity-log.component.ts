import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { bootstrapPcDisplay } from '@ng-icons/bootstrap-icons';
import { provideIcons } from '@ng-icons/core';
import { lucideUserCog, lucideUsersRound } from '@ng-icons/lucide';
import { phosphorStudentBold } from '@ng-icons/phosphor-icons/bold';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  ActivityEvent,
  ActivityLogStats,
  RoleFilter,
} from '../../../core/Models/Admin/activity-log.model';
import { ActivityLogService } from '../../../core/Services/activity-log.service';
import { AppRole } from '../../../core/types/app-role';
import { FilterChipsComponent } from './components/filter-chips/filter-chips.component';
import { KpiStripComponent } from './components/kpi-strip/kpi-strip.component';
import { LogPageHeaderComponent } from './components/log-page-header/log-page-header.component';
import { LogTableComponent } from './components/log-table/log-table.component';
import { LogToolbarComponent } from './components/log-toolbar/log-toolbar.component';

@Component({
  selector: 'app-activity-log',
  imports: [
    LogPageHeaderComponent,
    KpiStripComponent,
    LogToolbarComponent,
    FilterChipsComponent,
    LogTableComponent,
    NgmMotionDirective,
  ],
  templateUrl: './activity-log.component.html',
  viewProviders: [
    provideIcons({
      bootstrapPcDisplay,
      lucideUserCog,
      phosphorStudentBold,
      lucideUsersRound,
    }),
  ],
})
export class ActivityLogPageComponent implements OnInit {
  private readonly activityLogService = inject(ActivityLogService);
  private readonly PAGE_SIZE = 20;
  private readonly ROLES: AppRole[] = ['teacher', 'assistant', 'student', 'admin', 'system'];
  private readonly allEvents = signal<ActivityEvent[]>([]);
  private currentSkip = 0;

  protected readonly stats = signal<ActivityLogStats | null>(null);
  protected readonly activeFilter = signal<RoleFilter>('all');
  protected readonly searchQuery = signal('');
  protected readonly hasMore = signal(false);
  protected readonly loadingInitial = signal(true);
  protected readonly loadingMore = signal(false);

  protected readonly filteredEvents = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return this.allEvents().filter((ev) => {
      const matchesRole = filter === 'all' || ev.role === filter;
      const matchesSearch =
        !query || ev.user.toLowerCase().includes(query) || ev.action.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  });

  protected readonly chipCounts = computed(() => {
    const events = this.allEvents();

    // 1. Initialize all keys to guaranteed 0s
    const counts: Record<Exclude<RoleFilter, 'guest'>, number> = {
      all: events.length,
      teacher: 0,
      assistant: 0,
      student: 0,
      admin: 0,
      system: 0,
    };

    // 2. Count in a single O(N) pass
    for (const event of events) {
      if (event.role in counts) {
        counts[event.role as Exclude<RoleFilter, 'guest'>]++;
      }
    }

    return counts;
  });

  public ngOnInit(): void {
    this.loadInitial();
  }

  private loadInitial(): void {
    this.loadingInitial.set(true);
    this.currentSkip = 0;

    this.activityLogService.getActivityLog(0, this.PAGE_SIZE).subscribe({
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

  protected onLoadMore(): void {
    if (this.loadingMore() || !this.hasMore()) return;

    this.loadingMore.set(true);
    this.activityLogService.getActivityLog(this.currentSkip, this.PAGE_SIZE).subscribe({
      next: (res) => {
        this.allEvents.set([...this.allEvents(), ...res.events]);
        this.hasMore.set(res.hasMore);
        this.currentSkip += res.events.length;
        this.loadingMore.set(false);
      },
      error: () => this.loadingMore.set(false),
    });
  }

  protected onFilterChange(filter: RoleFilter): void {
    this.activeFilter.set(filter);
  }
}
