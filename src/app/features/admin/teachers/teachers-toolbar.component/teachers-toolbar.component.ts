import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  bootstrapArrowDown,
  bootstrapChevronDown,
  bootstrapChevronUp,
  bootstrapSearch,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { TeacherFilters, TeacherStatus } from '../../../../core/Models/Admin/teachers-admin.types';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-teachers-toolbar',
  imports: [FormsModule, NgmMotionDirective, NgIcon, SearchInputComponent],
  templateUrl: './teachers-toolbar.component.html',
  viewProviders: [
    provideIcons({
      bootstrapSearch,
      bootstrapChevronDown,
      bootstrapChevronUp,
      bootstrapArrowDown,
    }),
  ],
})
export class TeachersToolbarComponent {
  public readonly filters = model.required<TeacherFilters>();
  // public readonly filtersChange = output<TeacherFilters>();

  protected onQuery(query: string): void {
    this.filters.set({ ...this.filters(), query });
  }
  protected onStatus(status: string): void {
    this.filters.set({ ...this.filters(), status: status as TeacherStatus | 'all' });
  }
}
