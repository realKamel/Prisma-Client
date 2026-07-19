import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lesson-outcomes',

  imports: [],
  templateUrl: './lesson-outcomes-component.html',
})
export class LessonOutcomesComponent {
  readonly outcomes = input.required<string[]>();
}
