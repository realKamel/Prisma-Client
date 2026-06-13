import { Component, Input } from '@angular/core';
import { Chapter } from '../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-chapters',
  standalone: true,
  templateUrl: './lesson-chapters-component.html'
})
export class LessonChaptersComponent {
  @Input({ required: true }) chapters: Chapter[] = [];
}