import { Component, input } from '@angular/core';
import { bootstrapLightningCharge } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LessonResponse } from '../../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-hero',
  imports: [NgIcon],
  templateUrl: './lesson-hero.html',
  viewProviders: [
    provideIcons({
      bootstrapLightningCharge,
    }),
  ],
})
export class LessonHeroComponent {
  public readonly lesson = input.required<LessonResponse>();
}
