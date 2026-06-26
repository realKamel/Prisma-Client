import { Component, input, output } from '@angular/core';
import { TeacherLesson } from '../../../../../core/Models/Teacher/Teacherlesson.model';
import { AssistantLessonDto } from '../../../../../core/Models/Assistant/assistant-lesson.model';

@Component({
  selector: 'app-delete-lesson-modal',
  standalone: true,
  templateUrl: './delete-lesson-modal.component.html',
})
export class DeleteLessonModalComponent {
  lesson = input<AssistantLessonDto | null>(null);
  cancel = output<void>();
  confirm = output<void>();
}
