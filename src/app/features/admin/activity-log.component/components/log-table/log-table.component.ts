import { Component, input, output } from '@angular/core';
import {
  ActivityEvent,
  ActorRole,
  EventActionType,
  EventStatus,
} from '../../../../../core/Models/Admin/activity-log.model';
import { InitialsPipe } from '../pipes/initials.pipe';
import { RoleMetaPipe } from '../pipes/role-meta.pipe';
import { StatusMetaPipe } from '../pipes/status-meta.pipe';
import {
  RoleMeta,
  StatusMeta,
  ActionIconConfig,
} from '../../../../../core/Models/Admin/activity-ui.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapPlusCircleFill,
  bootstrapPencilFill,
  bootstrapTrashFill,
  bootstrapEyeFill,
  bootstrapSearch,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-log-table',
  imports: [NgIcon],
  templateUrl: './log-table.component.html',
  viewProviders: [
    provideIcons({
      bootstrapPlusCircleFill,
      bootstrapPencilFill,
      bootstrapTrashFill,
      bootstrapEyeFill,
      bootstrapSearch,
    }),
  ],
})
export class LogTableComponent {
  // 1. Manually migrated the skipped array input to a standard input signal
  readonly events = input<ActivityEvent[]>([]);

  readonly hasMore = input(false);
  readonly loadingMore = input(false);

  readonly loadMore = output<void>();

  private readonly roleMetaPipe = new RoleMetaPipe();
  private readonly statusMetaPipe = new StatusMetaPipe();
  private readonly initialsPipe = new InitialsPipe();

  protected readonly ACTION_ICON_CONFIG: Record<EventActionType, ActionIconConfig> = {
    insert: {
      icon: 'bootstrapPlusCircleFill',
      bgClass: 'bg-[rgba(78,203,141,0.14)]',
      colorClass: 'text-mint',
    },
    update: {
      icon: 'bootstrapPencilFill',
      bgClass: 'bg-[rgba(247,201,72,0.14)]',
      colorClass: 'text-[var(--star)]',
    },
    delete: {
      icon: 'bootstrapTrashFill',
      bgClass: 'bg-[rgba(240,106,106,0.14)]',
      colorClass: 'text-coral',
    },
    select: {
      icon: 'bootstrapEyeFill',
      bgClass: 'bg-[rgba(var(--accent-rgb),0.14)]',
      colorClass: 'text-primary-light',
    },
  };

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
    return this.ACTION_ICON_CONFIG[actionType] ?? this.ACTION_ICON_CONFIG.select;
  }

  trackEvent(_index: number, ev: ActivityEvent): string {
    return `${ev.time}-${ev.user}-${ev.action}`;
  }

  onLoadMoreClick(): void {
    if (this.loadingMore()) return;
    this.loadMore.emit();
  }
}
