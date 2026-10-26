import { Component, input } from '@angular/core';
import {
  bootstrapCameraVideo,
  bootstrapCircleFill,
  bootstrapClock,
  bootstrapCollection,
  bootstrapFileEarmarkPdf,
  bootstrapLockFill,
  bootstrapTrophy,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LessonCardData } from '../../../../../../../domain/lessons/models/lesson-expired';

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
  public readonly lesson = input.required<LessonCardData>();
}
