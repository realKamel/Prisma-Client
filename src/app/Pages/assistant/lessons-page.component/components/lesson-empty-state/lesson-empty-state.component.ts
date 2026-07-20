import { Component, input, output } from '@angular/core';
import { bootstrapInbox, bootstrapPlusLg } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-lesson-empty-state',
  imports: [NgIcon],
  templateUrl: './lesson-empty-state.component.html',
  viewProviders: [
    provideIcons({
      bootstrapInbox,
      bootstrapPlusLg,
    }),
  ],
})
export class LessonEmptyStateComponent {
  hasQuery = input(false);
  addLesson = output<void>();
}
