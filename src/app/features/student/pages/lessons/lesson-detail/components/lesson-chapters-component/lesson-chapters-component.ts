import { Component, computed, input } from '@angular/core';
import { bootstrapLockFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Chapter } from '../../../../../../../core/Models/lesson.model';
import { DurationPipe } from '../../../../../../../core/pipes/duration-pipe/duration-pipe';

@Component({
  selector: 'app-lesson-chapters',
  imports: [NgIcon, DurationPipe],
  templateUrl: './lesson-chapters-component.html',
  viewProviders: [
    provideIcons({
      bootstrapLockFill,
    }),
  ],
})
export class LessonChaptersComponent {
  public readonly chapters = input.required<Chapter[]>();

  protected readonly duration = computed(() => {
    return this.chapters().reduce((sum, item) => sum + item.duration.seconds, 0);
  });
}
