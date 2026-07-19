import { Component, input } from '@angular/core';
import { Prerequisite } from '../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-prerequisites',

  templateUrl: './lesson-prerequisites-component.html',
})
export class LessonPrerequisitesComponent {
  readonly prerequisites = input.required<Prerequisite[]>();
}
