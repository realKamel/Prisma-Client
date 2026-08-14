import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherFilters, TeacherStatus } from '../../../../core/Models/Admin/teachers-admin.types';

@Component({
  selector: 'app-teachers-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TeachersToolbarComponent {
  @Input({ required: true }) filters!: TeacherFilters;
  @Output() filtersChange = new EventEmitter<TeacherFilters>();

  onQuery(query: string): void {
    this.filtersChange.emit({ ...this.filters, query });
  }

  onStatus(status: string): void {
    this.filtersChange.emit({ ...this.filters, status: status as TeacherStatus | 'all' });
  }
}