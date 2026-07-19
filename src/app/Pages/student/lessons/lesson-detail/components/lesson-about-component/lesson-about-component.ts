import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lesson-about',

  imports: [],
  templateUrl: './lesson-about-component.html',
})
export class LessonAboutComponent {
  readonly text = input.required<string>();
}
