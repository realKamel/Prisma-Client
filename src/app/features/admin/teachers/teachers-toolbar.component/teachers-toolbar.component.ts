import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TeacherFilters, TeacherStatus } from '../../../../core/Models/Admin/teachers-admin.types';

@Component({
  selector: 'app-teachers-toolbar',
  imports: [FormsModule],
  templateUrl: './teachers-toolbar.component.html',
})
export class TeachersToolbarComponent {
  readonly filters = input.required<TeacherFilters>();
  readonly filtersChange = output<TeacherFilters>();

  onQuery(query: string): void {
    this.filtersChange.emit({ ...this.filters(), query });
  }
  onStatus(status: string): void {
    this.filtersChange.emit({ ...this.filters(), status: status as TeacherStatus | 'all' });
  }
}
