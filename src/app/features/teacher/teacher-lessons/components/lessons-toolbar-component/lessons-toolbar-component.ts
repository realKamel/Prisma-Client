import { Component, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  bootstrapChevronDown,
  bootstrapCloudUpload,
  bootstrapPlusLg,
  bootstrapSearch,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { SearchInputComponent } from '../../../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-lessons-toolbar',
  imports: [FormsModule, RouterModule, NgIcon, NgmMotionDirective, SearchInputComponent],
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
  public readonly searchChange = output<string>();
  public readonly statusChange = output<string>();

  public readonly searchQuery = model('');
  public readonly statusFilter = signal('all');

  protected onStatusChange(): void {
    this.statusChange.emit(this.statusFilter());
  }
}
