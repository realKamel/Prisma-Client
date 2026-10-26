import { Component, input } from '@angular/core';
import {
  bootstrapCheckCircleFill,
  bootstrapCircle,
  bootstrapDashCircleFill,
  bootstrapXCircleFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Permission } from '../../../models/assistant-dashboard.model';

@Component({
  selector: 'app-permissions-card',
  imports: [NgIcon],
  templateUrl: './permissions-card-component.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckCircleFill,
      bootstrapDashCircleFill,
      bootstrapXCircleFill,
      bootstrapCircle,
    }),
  ],
})
export class PermissionsCardComponent {
  readonly permissions = input<Permission[]>([]);

  badgeClasses(status: string): string {
    const map: Record<string, string> = {
      on: 'bg-[rgba(78,203,141,.16)] text-mint',
      restricted: 'bg-[rgba(247,201,72,.14)] text-star',
      off: 'bg-[rgba(145,144,168,.12)] text-muted',
    };
    return map[status] ?? map['off'];
  }

  badgeLabel(status: string): string {
    const map: Record<string, string> = {
      on: 'مفعّلة',
      restricted: 'مقيّدة',
      off: 'غير مفعّلة',
    };
    return map[status] ?? '';
  }

  badgeIcon(status: string): string {
    const map: Record<string, string> = {
      on: 'bootstrapCheckCircleFill',
      restricted: 'bootstrapDashCircleFill',
      off: 'bootstrapXCircleFill',
    };
    return map[status] ?? 'bootstrapCircle';
  }
}
