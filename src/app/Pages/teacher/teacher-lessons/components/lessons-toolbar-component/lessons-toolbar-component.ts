import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  bootstrapChevronDown,
  bootstrapCloudUpload,
  bootstrapPlusLg,
  bootstrapSearch,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-lessons-toolbar',
  imports: [FormsModule, RouterModule, NgIcon],
  templateUrl: './lessons-toolbar-component.html',
  providers: [
    provideIcons({
      bootstrapSearch,
      bootstrapChevronDown,
      bootstrapCloudUpload,
      bootstrapPlusLg,
    }),
  ],
})
export class LessonsToolbarComponent {
  readonly searchChange = output<string>();
  readonly statusChange = output<string>();

  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal('all');

  onSearch(): void {
    this.searchChange.emit(this.searchQuery());
  }

  onStatusChange(): void {
    this.statusChange.emit(this.statusFilter());
  }
}
