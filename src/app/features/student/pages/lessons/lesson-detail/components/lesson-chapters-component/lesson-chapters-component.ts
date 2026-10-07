import { Component, OnChanges, input, signal } from '@angular/core';
import { Chapter } from '../../../../../../../core/Models/lesson.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapLockFill } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-lesson-chapters',
  imports: [NgIcon],
  templateUrl: './lesson-chapters-component.html',
  viewProviders: [
    provideIcons({
      bootstrapLockFill,
    }),
  ],
})
export class LessonChaptersComponent implements OnChanges {
  readonly chapters = input.required<Chapter[]>();

  duration = signal('');

  ngOnChanges(): void {
    const totalMinutes = this.chapters().reduce((sum, item) => sum + parseInt(item.duration), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes > 0 && hours > 0) {
      this.duration.set(`${hours} ساعة ${minutes} دقيقة`);
    } else if (minutes == 0) {
      this.duration.set(`${hours} ساعة `);
    } else if (hours == 0) {
      this.duration.set(`${minutes} دقيقة`);
    }
  }
}
