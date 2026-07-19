import { Component, input, Input } from '@angular/core';
import { LessonCardData } from '../../../../../../core/Models/lesson-expired';

@Component({
  selector: 'app-expired-lesson-card',
  imports: [],
  templateUrl: './expired-lesson-card-component.html',
})
export class ExpiredLessonCardComponent {
  // @Input() lesson!: LessonCardData;
  readonly lesson = input.required<LessonCardData>();
}
