import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { bootstrapPeople } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  STATUS_LABELS,
  Teacher,
  TeacherStatus,
} from '../../../../core/Models/Admin/teachers-admin.types';

@Component({
  selector: 'app-teachers-table',
  imports: [NgmMotionDirective, NgIcon, DecimalPipe, CurrencyPipe],
  templateUrl: './teachers-table.component.html',
  viewProviders: [provideIcons({ bootstrapPeople })],
})
export class TeachersTableComponent {
  public readonly teachers = input.required<Teacher[]>();
  public readonly openSuspend = output<string>();
  public readonly activate = output<string>();

  public readonly STATUS_LABELS = STATUS_LABELS;

  protected statusPillClasses(status: TeacherStatus): string {
    switch (status) {
      case 'active':
        return 'border border-[color-mix(in_srgb,var(--color-mint)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-mint)_12%,transparent)] text-mint';
      case 'suspended':
        return 'border border-[color-mix(in_srgb,var(--color-coral)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-coral)_12%,transparent)] text-coral';
    }
  }

  protected statusDotClasses(status: TeacherStatus): string {
    switch (status) {
      case 'active':
        return 'bg-mint';
      case 'suspended':
        return 'bg-coral';
    }
  }
}
