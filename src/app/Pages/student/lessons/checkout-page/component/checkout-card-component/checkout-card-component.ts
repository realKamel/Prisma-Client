import { Component, inject } from '@angular/core';
import { LessonContextComponent } from "../lesson-context-component/lesson-context-component";
import { LessonService } from '../../../../../../core/Services/lesson.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-card',
  standalone: true,
  imports: [LessonContextComponent, CommonModule, RouterLink],
  templateUrl: './checkout-card-component.html'
})
export class CheckoutCardComponent {
    lessonService = inject(LessonService);

  get lesson() {
    return this.lessonService.currentLesson;
  }

  processPayment() { console.log('Processing Card...'); }
}