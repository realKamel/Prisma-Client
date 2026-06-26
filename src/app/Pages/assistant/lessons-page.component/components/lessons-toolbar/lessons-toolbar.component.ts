import { Component, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lessons-toolbar',
  standalone: true,
  templateUrl: './lessons-toolbar.component.html',
  imports: [RouterLink],
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
