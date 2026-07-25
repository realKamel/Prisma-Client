import { Component, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bootstrapSearch, bootstrapCloudUpload, bootstrapPlusLg } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-lessons-toolbar',
  templateUrl: './lessons-toolbar.component.html',
  imports: [RouterLink, NgIcon],
  viewProviders: [
    provideIcons({
      bootstrapSearch,
      bootstrapCloudUpload,
      bootstrapPlusLg,
    }),
  ],
})
export class LessonsToolbarComponent {
  readonly search = output<string>();
  readonly addLesson = output<void>();
  readonly uploadMaterials = output<void>();

  readonly query = signal('');

  onInput(value: string): void {
    this.query.set(value);
    this.search.emit(value);
  }
}
