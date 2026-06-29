import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ArabicNumeralsPipe } from '../pipes/arabic-numerals.pipe';
import { RoleFilter } from '../../../../../core/Models/Admin/activity-log.model';


interface ChipDef {
  id: RoleFilter;
  label: string;
}

@Component({
  selector: 'app-filter-chips',
  standalone: true,
  imports: [ArabicNumeralsPipe],
  templateUrl: './filter-chips.component.html',
})
export class FilterChipsComponent {
  @Input() activeFilter: RoleFilter = 'all';
  @Input() counts: Record<RoleFilter, number> = {
    all: 0,
    teacher: 0,
    assistant: 0,
    student: 0,
    admin: 0,
    system: 0,
  };
  @Output() filterChange = new EventEmitter<RoleFilter>();

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
