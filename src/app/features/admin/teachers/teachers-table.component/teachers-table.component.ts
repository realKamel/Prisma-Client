import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Teacher,
  STATUS_LABELS,
  TeacherStatus,
} from '../../../../core/Models/Admin/teachers-admin.types';
import { toAr } from '../to-ar';

@Component({
  selector: 'app-teachers-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teachers-table.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TeachersTableComponent {
  readonly teachers = input.required<Teacher[]>();

  // 🌟 تحويل الـ Output لتمرير string بدل number للـ Guid
  readonly openSuspend = output<string>();
  readonly activate = output<string>();

  readonly STATUS_LABELS = STATUS_LABELS;
  readonly toAr = toAr;

  statusPillClasses(status: TeacherStatus): string {
    switch (status) {
      case 'active':
        return 'border border-[color-mix(in_srgb,var(--color-mint)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-mint)_12%,transparent)] text-mint';
      case 'suspended':
        return 'border border-[color-mix(in_srgb,var(--color-coral)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-coral)_12%,transparent)] text-coral';
    }
  }

  statusDotClasses(status: TeacherStatus): string {
    switch (status) {
      case 'active':
        return 'bg-mint';
      case 'suspended':
        return 'bg-coral';
    }
  }
}
