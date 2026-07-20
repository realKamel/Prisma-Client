import { Component, OnInit, inject, input } from '@angular/core';
import { LessonService } from '../../../../../../core/Services/lesson.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapLightningCharge } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-lesson-context',
  imports: [NgIcon],
  templateUrl: './lesson-context-component.html',
  viewProviders: [
    provideIcons({
      bootstrapLightningCharge,
    }),
  ],
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
