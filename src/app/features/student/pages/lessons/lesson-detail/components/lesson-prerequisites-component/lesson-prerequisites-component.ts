import { Component, input } from '@angular/core';
import {
  bootstrapCheck2,
  bootstrapCheckAll,
  bootstrapJournalBookmark,
  bootstrapX,
  bootstrapXCircle,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Prerequisite } from '../../../../../../../domain/lessons/models/lesson.model';

@Component({
  selector: 'app-lesson-prerequisites',
  imports: [NgIcon],
  templateUrl: './lesson-prerequisites-component.html',
  viewProviders: [
    provideIcons({
      bootstrapJournalBookmark,
      bootstrapCheck2,
      bootstrapX,
      bootstrapCheckAll,
      bootstrapXCircle,
    }),
  ],
})
export class LessonPrerequisitesComponent {
  public readonly prerequisites = input.required<Prerequisite[]>();
}
