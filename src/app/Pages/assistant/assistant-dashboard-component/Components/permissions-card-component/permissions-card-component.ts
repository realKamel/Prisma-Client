import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Permission } from '../../../../../core/Models/Assistant/assistant-dashboard.model';

@Component({
  selector: 'app-permissions-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permissions-card-component.html',
})
export class PermissionsCardComponent {
  @Input() permissions: Permission[] = [];

  badgeClasses(status: string): string {
    const map: Record<string, string> = {
      on:         'bg-[rgba(78,203,141,.16)] text-[var(--mint)]',
      restricted: 'bg-[rgba(247,201,72,.14)] text-[var(--star)]',
      off:        'bg-[rgba(145,144,168,.12)] text-[var(--muted)]',
    };
    return map[status] ?? map['off'];
  }

  badgeLabel(status: string): string {
    const map: Record<string, string> = {
      on:         'مفعّلة',
      restricted: 'مقيّدة',
      off:        'غير مفعّلة',
    };
    return map[status] ?? '';
  }

  badgeIcon(status: string): string {
    const map: Record<string, string> = {
      on:         'bi-check-circle-fill',
      restricted: 'bi-dash-circle-fill',
      off:        'bi-x-circle-fill',
    };
    return map[status] ?? 'bi-circle';
  }
}