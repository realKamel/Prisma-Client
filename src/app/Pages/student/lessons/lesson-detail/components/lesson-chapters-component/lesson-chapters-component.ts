import { Component, Input, OnChanges } from '@angular/core';
import { Chapter } from '../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-chapters',
  standalone: true,
  templateUrl: './lesson-chapters-component.html'
})
export class LessonChaptersComponent implements OnChanges {
  @Input({ required: true }) chapters: Chapter[] = [];


duration = '';

ngOnChanges(): void {
  const totalMinutes = this.chapters.reduce((sum, item) => sum + parseInt(item.duration), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  this.duration = hours > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${minutes} د`;
}

}