import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { bootstrapArrowLeft } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { NextLessonDto } from '../../../../../../core/Models/Student/Dashboard.Models';

@Component({
  selector: 'app-next-lesson-card',
  imports: [RouterModule, NgIcon, NgmMotionDirective],
  templateUrl: './next-lesson-card.html',
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
    }),
  ],
})
export class NextLessonCardComponent {
  public readonly lesson = input<NextLessonDto>();

  protected readonly progressWidth = computed(() => {
    const l = this.lesson();
    if (!l || !l.totalChapters) return '0%';
    return `${(l.currentChapter * 100) / l.totalChapters}%`;
  });
}
