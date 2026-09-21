import { Component, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bootstrapCloudUpload, bootstrapPlusLg, bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { SearchInputComponent } from '../../../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-lessons-toolbar',
  templateUrl: './lessons-toolbar.component.html',
  imports: [RouterLink, NgIcon, SearchInputComponent],
  viewProviders: [
    provideIcons({
      bootstrapSearch,
      bootstrapCloudUpload,
      bootstrapPlusLg,
    }),
  ],
})
export class LessonsToolbarComponent {
  public readonly searchQuery = output<string>();
  public readonly addLesson = output<void>();
  public readonly uploadMaterials = output<void>();

  public readonly query = signal('');

  public onInput(): void {
    this.searchQuery.emit(this.query());
  }
}
