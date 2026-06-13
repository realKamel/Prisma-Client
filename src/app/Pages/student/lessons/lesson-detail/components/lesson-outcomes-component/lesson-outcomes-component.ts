import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lesson-outcomes',
  standalone: true,
  imports: [],
  templateUrl: './lesson-outcomes-component.html'
})
export class LessonOutcomesComponent {
  @Input({ required: true }) outcomes: string[] = [];
}