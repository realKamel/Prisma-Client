import { Component, inject } from '@angular/core';
import { LessonContextComponent } from "../lesson-context-component/lesson-context-component";
import { LessonService } from '../../../../../../core/Services/lesson.service';

@Component({
  selector: 'app-checkout-card',
  standalone: true,
  imports: [LessonContextComponent],
  templateUrl: './checkout-card-component.html'
})
export class CheckoutCardComponent {
    lessonService = inject(LessonService);

  get lesson() {
    return this.lessonService.currentLesson;
  }

  processPayment() { console.log('Processing Card...'); }
}