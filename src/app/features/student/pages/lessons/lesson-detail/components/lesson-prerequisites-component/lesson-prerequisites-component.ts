import { Component, input } from '@angular/core';
import { Prerequisite } from '../../../../../../../core/Models/lesson.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapJournalBookmark,
  bootstrapCheck2,
  bootstrapX,
  bootstrapCheckAll,
  bootstrapXCircle,
} from '@ng-icons/bootstrap-icons';

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
  readonly prerequisites = input.required<Prerequisite[]>();
}
