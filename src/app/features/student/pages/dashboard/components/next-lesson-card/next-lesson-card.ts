import { Component, computed, input, signal } from '@angular/core';
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
  imageError = signal(false);

  protected readonly progressPercent = computed(() => {
    const l = this.lesson();
    if (!l?.totalChapters) return 0;
    return Math.min(100, Math.round(((l.currentChapter-1) * 100) / l.totalChapters));
  });

  protected readonly progressWidth = computed(() => `${this.progressPercent()}%`);
  protected readonly isComplete = computed(() => this.progressPercent() >= 100);
}
