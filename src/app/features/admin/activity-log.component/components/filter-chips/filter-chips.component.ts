import { Component, output, input } from '@angular/core';
import { RoleFilter } from '../../../../../core/Models/Admin/activity-log.model';
import { DecimalPipe } from '@angular/common';

interface ChipDef {
  id: RoleFilter;
  label: string;
}

@Component({
  selector: 'app-filter-chips',
  imports: [DecimalPipe],
  templateUrl: './filter-chips.component.html',
})
export class FilterChipsComponent {
  readonly activeFilter = input<RoleFilter>('all');
  readonly counts = input<Record<RoleFilter, number>>({
    all: 0,
    teacher: 0,
    assistant: 0,
    student: 0,
    admin: 0,
    system: 0,
  });
  readonly filterChange = output<RoleFilter>();

  readonly chips: ChipDef[] = [
    { id: 'all', label: 'الكل' },
    { id: 'teacher', label: 'معلمون' },
    { id: 'assistant', label: 'مساعدون' },
    { id: 'student', label: 'طلاب' },
    { id: 'admin', label: 'مدير' },
    { id: 'system', label: 'النظام' },
  ];

  select(id: RoleFilter): void {
    this.filterChange.emit(id);
  }
}
