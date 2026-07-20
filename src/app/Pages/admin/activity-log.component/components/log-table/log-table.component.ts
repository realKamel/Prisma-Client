import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivityEvent, ActorRole, EventActionType, EventStatus } from '../../../../../core/Models/Admin/activity-log.model';
import { InitialsPipe } from '../pipes/initials.pipe';
import { RoleMetaPipe, RoleMeta } from '../pipes/role-meta.pipe';
import { StatusMetaPipe, StatusMeta } from '../pipes/status-meta.pipe';

interface ActionIconConfig {
  icon: string;
  bgClass: string;
  colorClass: string;
}

// نفس فكرة ACTIVITY_ICON_CONFIG في activity-item، بس مبني على نوع الفعل
// (إضافة/تعديل/حذف/اطلاع) بدل نوع النشاط، عشان صف الجدول يطلع بنفس روح الكارت.
const ACTION_ICON_CONFIG: Record<EventActionType, ActionIconConfig> = {
  insert: { icon: 'bi-plus-circle-fill', bgClass: 'bg-[rgba(78,203,141,0.14)]', colorClass: 'text-[var(--mint)]' },
  update: { icon: 'bi-pencil-fill', bgClass: 'bg-[rgba(247,201,72,0.14)]', colorClass: 'text-[var(--star)]' },
  delete: { icon: 'bi-trash-fill', bgClass: 'bg-[rgba(240,106,106,0.14)]', colorClass: 'text-[var(--coral)]' },
  select: { icon: 'bi-eye-fill', bgClass: 'bg-[rgba(var(--accent-rgb),0.14)]', colorClass: 'text-[var(--purple-lt)]' },
};

@Component({
  selector: 'app-log-table',
  standalone: true,
  templateUrl: './log-table.component.html',
})
export class LogTableComponent {
  @Input() events: ActivityEvent[] = [];
  @Input() hasMore = false;
  @Input() loadingMore = false;

  @Output() loadMore = new EventEmitter<void>();

  // Pure pipes instantiated directly so the template can call them as plain
  // methods once per row, instead of re-running the `| roleMeta` pipe three
  // separate times per row.
  private readonly roleMetaPipe = new RoleMetaPipe();
  private readonly statusMetaPipe = new StatusMetaPipe();
  private readonly initialsPipe = new InitialsPipe();

  roleMeta(role: ActorRole): RoleMeta {
    return this.roleMetaPipe.transform(role);
  }

  statusMeta(status: EventStatus): StatusMeta {
    return this.statusMetaPipe.transform(status);
  }

  initials(name: string): string {
    return this.initialsPipe.transform(name);
  }

  actionIcon(actionType: EventActionType): ActionIconConfig {
    return ACTION_ICON_CONFIG[actionType] ?? ACTION_ICON_CONFIG.select;
  }

  trackEvent(_index: number, ev: ActivityEvent): string {
    return `${ev.time}-${ev.user}-${ev.action}`;
  }

  onLoadMoreClick(): void {
    if (this.loadingMore) return;
    this.loadMore.emit();
  }
}