import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-lesson-empty-state',
  standalone: true,
  templateUrl: './lesson-empty-state.component.html',
})
export class LessonEmptyStateComponent {
  hasQuery = input(false);
  addLesson = output<void>();
}
