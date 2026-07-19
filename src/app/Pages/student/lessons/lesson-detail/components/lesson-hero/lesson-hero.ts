import { Component, input } from '@angular/core';
import { LessonResponse } from '../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-hero',

  templateUrl: './lesson-hero.html',
})
export class LessonHeroComponent {
  readonly lesson = input.required<LessonResponse>();
  imgError = false;
}
