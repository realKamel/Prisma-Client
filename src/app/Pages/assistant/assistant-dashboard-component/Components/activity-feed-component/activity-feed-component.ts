import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityItem } from '../../../../../core/Models/Assistant/assistant-dashboard.model';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-feed-component.html',
})
export class ActivityFeedComponent {
  @Input() activities: ActivityItem[] = [];

  iconBg(type: string): string {
    const map: Record<string, string> = {
      grant:  'bg-[rgba(78,203,141,.16)]',
      revoke: 'bg-[rgba(240,106,106,.16)]',
      view:   'bg-[rgba(var(--accent-rgb),.16)]',
      search: 'bg-[rgba(247,201,72,.16)]',
      attend: 'bg-[rgba(78,203,141,.12)]',
      grade:  'bg-[rgba(247,201,72,.12)]',
      report: 'bg-[rgba(var(--accent-rgb),.12)]',
    };
    return map[type] ?? 'bg-[var(--surface2)]';
  }

  iconColor(type: string): string {
    const map: Record<string, string> = {
      grant:  'text-[var(--mint)]',
      revoke: 'text-[var(--coral)]',
      view:   'text-[var(--purple-lt)]',
      search: 'text-[var(--star)]',
      attend: 'text-[var(--mint)]',
      grade:  'text-[var(--star)]',
      report: 'text-[var(--purple-lt)]',
    };
    return map[type] ?? 'text-[var(--muted)]';
  }
}