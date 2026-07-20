import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LessonCardData } from '../../../../../../core/Models/lesson-expired';

@Component({
  selector: 'app-expired-lesson-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./expired-lesson-card-component.html',
})
export class ExpiredLessonCardComponent {
  @Input() lesson!: LessonCardData;
}