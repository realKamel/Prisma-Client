import { Component, input } from '@angular/core';
import { LessonResponse } from '../../../../../../core/Models/lesson.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapLightningCharge } from '@ng-icons/bootstrap-icons';

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
  readonly lesson = input.required<LessonResponse>();
  imgError = false;
}
