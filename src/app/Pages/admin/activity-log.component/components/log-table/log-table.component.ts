import { Component, input, output } from '@angular/core';
import {
  ActivityEvent,
  ActorRole,
  EventActionType,
  EventStatus,
} from '../../../../../core/Models/Admin/activity-log.model';
import { InitialsPipe } from '../pipes/initials.pipe';
import { RoleMetaPipe, RoleMeta } from '../pipes/role-meta.pipe';
import { StatusMetaPipe, StatusMeta } from '../pipes/status-meta.pipe';
import { NgIcon } from '@ng-icons/core';
import {
  bootstrapPlusCircleFill,
  bootstrapPencilFill,
  bootstrapTrashFill,
  bootstrapEyeFill,
  bootstrapSearch,
} from '@ng-icons/bootstrap-icons';

interface ActionIconConfig {
  icon: string;
  bgClass: string;
  colorClass: string;
}

const ACTION_ICON_CONFIG: Record<EventActionType, ActionIconConfig> = {
  insert: {
    icon: 'bootstrapPlusCircleFill',
    bgClass: 'bg-[rgba(78,203,141,0.14)]',
    colorClass: 'text-[var(--mint)]',
  },
  update: {
    icon: 'bootstrapPencilFill',
    bgClass: 'bg-[rgba(247,201,72,0.14)]',
    colorClass: 'text-[var(--star)]',
  },
  delete: {
    icon: 'bootstrapTrashFill',
    bgClass: 'bg-[rgba(240,106,106,0.14)]',
    colorClass: 'text-[var(--coral)]',
  },
  select: {
    icon: 'bootstrapEyeFill',
    bgClass: 'bg-[rgba(var(--accent-rgb),0.14)]',
    colorClass: 'text-[var(--purple-lt)]',
  },
};
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
    if (this.loadingMore()) return;
    this.loadMore.emit();
  }
}
function provideIcons(arg0: {
  bootstrapPlusCircleFill: any;
  bootstrapPencilFill: any;
  bootstrapTrashFill: any;
  bootstrapEyeFill: any;
  bootstrapSearch: any;
}): import('@angular/core').Provider {
  throw new Error('Function not implemented.');
}
