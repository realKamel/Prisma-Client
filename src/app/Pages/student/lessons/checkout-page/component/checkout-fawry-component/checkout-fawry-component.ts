import { Component, inject } from '@angular/core';
import { LessonContextComponent } from "../lesson-context-component/lesson-context-component";
import { LessonService } from '../../../../../../core/Services/lesson.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-checkout-fawry',
  standalone: true,
  imports: [LessonContextComponent, CommonModule, RouterLink],
  templateUrl: './checkout-fawry-component.html'
})
export class CheckoutFawryComponent {
    lessonService = inject(LessonService);

  get lesson() {
    return this.lessonService.currentLesson;
  }

  requestCode() { console.log('Requesting Fawry code...'); }
}