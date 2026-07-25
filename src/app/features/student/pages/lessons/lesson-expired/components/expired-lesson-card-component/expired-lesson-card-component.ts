import { Component, input } from '@angular/core';
import { LessonCardData } from '../../../../../../../core/Models/lesson-expired';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCameraVideo,
  bootstrapLockFill,
  bootstrapClock,
  bootstrapCircleFill,
  bootstrapCollection,
  bootstrapFileEarmarkPdf,
  bootstrapTrophy,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-expired-lesson-card',
  imports: [NgIcon],
  templateUrl: './expired-lesson-card-component.html',
  viewProviders: [
    provideIcons({
      bootstrapCameraVideo,
      bootstrapLockFill,
      bootstrapClock,
      bootstrapCircleFill,
      bootstrapCollection,
      bootstrapFileEarmarkPdf,
      bootstrapTrophy,
    }),
  ],
})
export class ExpiredLessonCardComponent {
  readonly lesson = input.required<LessonCardData>();
}
