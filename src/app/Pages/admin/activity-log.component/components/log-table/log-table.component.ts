import { Component, Input } from '@angular/core';
import { ActivityEvent, ActorRole, EventStatus } from '../../../../../core/Models/Admin/activity-log.model';
import { InitialsPipe } from '../pipes/initials.pipe';
import { RoleMetaPipe, RoleMeta } from '../pipes/role-meta.pipe';
import { StatusMetaPipe, StatusMeta } from '../pipes/status-meta.pipe';


@Component({
  selector: 'app-log-table',
  standalone: true,
  templateUrl: './log-table.component.html',
})
export class LogTableComponent {
  @Input() events: ActivityEvent[] = [];

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

  trackEvent(_index: number, ev: ActivityEvent): string {
    return `${ev.time}-${ev.user}-${ev.action}`;
  }
}
