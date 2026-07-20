import { Component, input } from '@angular/core';
import { bootstrapCheckCircleFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-lesson-outcomes',
  imports: [NgIcon],
  templateUrl: './lesson-outcomes-component.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckCircleFill,
    }),
  ],
})
export class LessonOutcomesComponent {
  readonly outcomes = input.required<string[]>();
}
