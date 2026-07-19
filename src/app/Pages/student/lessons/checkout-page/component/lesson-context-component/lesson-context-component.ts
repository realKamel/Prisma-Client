import { Component, OnInit, inject, input } from '@angular/core';
import { LessonService } from '../../../../../../core/Services/lesson.service';

@Component({
  selector: 'app-lesson-context',
  imports: [],
  templateUrl: './lesson-context-component.html',
})
export class LessonContextComponent implements OnInit {
  lessonService = inject(LessonService);
  // readonly id = input.required<string>();
  readonly id = input.required<string>();

  ngOnInit() {
    if (!this.lessonService.currentLesson) {
      this.lessonService.getLessonDetails(this.id()).subscribe();
    }
  }
}
