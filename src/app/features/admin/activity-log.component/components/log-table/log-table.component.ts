import { Component, input, output } from '@angular/core';
import {
  bootstrapEyeFill,
  bootstrapPencilFill,
  bootstrapPlusCircleFill,
  bootstrapSearch,
  bootstrapTrashFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  ActivityEvent,
  ActorRole,
  EventActionType,
  EventStatus,
} from '../../../../../core/Models/Admin/activity-log.model';
import {
  ActionIconConfig,
  RoleMeta,
  StatusMeta,
} from '../../../../../core/Models/Admin/activity-ui.model';
import { InitialsPipe } from '../pipes/initials.pipe';
import { RoleMetaPipe } from '../pipes/role-meta.pipe';
import { StatusMetaPipe } from '../pipes/status-meta.pipe';

@Component({
  selector: 'app-log-table',
  imports: [NgIcon, NgmMotionDirective],
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
  public readonly events = input<ActivityEvent[]>([]);

  public readonly hasMore = input(false);
  public readonly loadingMore = input(false);

  public readonly loadMore = output<void>();

  private readonly roleMetaPipe = new RoleMetaPipe();
  private readonly statusMetaPipe = new StatusMetaPipe();
  private readonly initialsPipe = new InitialsPipe();

  protected readonly ACTION_ICON_CONFIG: Record<EventActionType, ActionIconConfig> = {
    insert: {
      icon: 'bootstrapPlusCircleFill',
      bgClass: 'bg-mint/10',
      colorClass: 'text-mint',
    },
    update: {
      icon: 'bootstrapPencilFill',
      bgClass: 'bg-star/10',
      colorClass: 'text-star',
    },
    delete: {
      icon: 'bootstrapTrashFill',
      bgClass: 'bg-coral/10',
      colorClass: 'text-coral',
    },
    select: {
      icon: 'bootstrapEyeFill',
      bgClass: 'bg-primary/10',
      colorClass: 'text-primary-light',
    },
  };

  protected roleMeta(role: ActorRole): RoleMeta {
    return this.roleMetaPipe.transform(role);
  }

  protected statusMeta(status: EventStatus): StatusMeta {
    return this.statusMetaPipe.transform(status);
  }

  protected initials(name: string): string {
    return this.initialsPipe.transform(name);
  }

  protected actionIcon(actionType: EventActionType): ActionIconConfig {
    return this.ACTION_ICON_CONFIG[actionType] ?? this.ACTION_ICON_CONFIG.select;
  }

  protected trackEvent(_index: number, ev: ActivityEvent): string {
    return `${ev.time}-${ev.user}-${ev.action}`;
  }

  protected onLoadMoreClick(): void {
    if (this.loadingMore()) return;
    this.loadMore.emit();
  }
}
