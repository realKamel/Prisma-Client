import { Component, Input } from '@angular/core';
import { LessonResponse } from '../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-hero',
  standalone: true,
  templateUrl: './lesson-hero.html'
})
export class LessonHeroComponent {
  @Input({ required: true }) lesson!: LessonResponse;
  imgError = false;
}