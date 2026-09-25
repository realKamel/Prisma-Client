import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { RoleFilter } from '../../../../../core/Models/Admin/activity-log.model';
import { ChipDef } from '../../../../../core/Models/Admin/activity-ui.model';

@Component({
  selector: 'app-filter-chips',
  imports: [DecimalPipe, NgmMotionDirective],
  templateUrl: './filter-chips.component.html',
})
export class FilterChipsComponent {
  public readonly activeFilter = input<RoleFilter>('all');
  public readonly counts = input<Record<Exclude<RoleFilter, 'guest'>, number>>({
    all: 0,
    teacher: 0,
    assistant: 0,
    student: 0,
    admin: 0,
    system: 0,
  });
  public readonly filterChange = output<RoleFilter>();
  protected getCount(id: RoleFilter): number {
    if (id === 'guest') return 0;
    return this.counts()[id] ?? 0;
  }
  protected readonly chips: ChipDef[] = [
    { id: 'all', label: 'الكل' },
    { id: 'teacher', label: 'معلمون' },
    { id: 'assistant', label: 'مساعدون' },
    { id: 'student', label: 'طلاب' },
    { id: 'admin', label: 'مدير' },
    { id: 'system', label: 'النظام' },
  ];

  protected select(id: RoleFilter): void {
    this.filterChange.emit(id);
  }
}
