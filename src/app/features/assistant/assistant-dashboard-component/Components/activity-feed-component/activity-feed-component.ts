import { Component, input } from '@angular/core';
import { ActivityItem } from '../../../../../core/Models/Assistant/assistant-dashboard.model';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-activity-feed',
  imports: [RouterLink, NgIcon],
  templateUrl: './activity-feed-component.html',
})
export class ActivityFeedComponent {
  readonly activities = input<ActivityItem[]>([]);

  iconBg(type: string): string {
    const map: Record<string, string> = {
      grant: 'bg-[rgba(78,203,141,.16)]',
      revoke: 'bg-[rgba(240,106,106,.16)]',
      view: 'bg-[rgba(var(--accent-rgb),.16)]',
      search: 'bg-[rgba(247,201,72,.16)]',
      attend: 'bg-[rgba(78,203,141,.12)]',
      grade: 'bg-[rgba(247,201,72,.12)]',
      report: 'bg-[rgba(var(--accent-rgb),.12)]',
    };
    return map[type] ?? 'bg-[var(--surface2)]';
  }

  iconColor(type: string): string {
    const map: Record<string, string> = {
      grant: 'text-mint',
      revoke: 'text-coral',
      view: 'text-primary-light',
      search: 'text-[var(--star)]',
      attend: 'text-mint',
      grade: 'text-[var(--star)]',
      report: 'text-primary-light',
    };
    return map[type] ?? 'text-muted';
  }
}
