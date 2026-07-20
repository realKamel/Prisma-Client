import { Component, Input } from '@angular/core';
import { Prerequisite } from '../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-prerequisites',
  standalone: true,
  templateUrl: './lesson-prerequisites-component.html'
})
export class LessonPrerequisitesComponent {
  @Input({ required: true }) prerequisites: Prerequisite[] = [];
}