import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LessonService } from '../../../../../../core/Services/lesson.service';
import { LessonResponse } from '../../../../../../core/Models/lesson.model';

@Component({
  standalone: true,
  selector: 'app-lesson-context',
  imports: [CommonModule],
  templateUrl: './lesson-context-component.html'
})
export class LessonContextComponent implements OnInit {
  lessonService = inject(LessonService);
  @Input() id!: string; 

  ngOnInit() {
    if (!this.lessonService.currentLesson) {
      this.lessonService.getLessonDetails(this.id).subscribe();
    }
  }
}