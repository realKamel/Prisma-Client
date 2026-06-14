import { Component, inject } from '@angular/core';
import { LessonContextComponent } from "../lesson-context-component/lesson-context-component";
import { LessonService } from '../../../../../../core/Services/lesson.service';

@Component({
  selector: 'app-checkout-fawry',
  standalone: true,
  imports: [LessonContextComponent],
  templateUrl: './checkout-fawry-component.html'
})
export class CheckoutFawryComponent {
    lessonService = inject(LessonService);

  get lesson() {
    return this.lessonService.currentLesson;
  }

  requestCode() { console.log('Requesting Fawry code...'); }
}