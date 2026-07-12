import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lesson-about',
  standalone: true,
  imports: [],
  templateUrl: './lesson-about-component.html'
})
export class LessonAboutComponent {
  @Input({ required: true }) text!: string;
}