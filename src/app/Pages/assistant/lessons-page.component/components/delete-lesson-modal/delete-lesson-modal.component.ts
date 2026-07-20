import { Component, input, output } from '@angular/core';
import { AssistantLessonDto } from '../../../../../core/Models/Assistant/assistant-lesson.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapExclamationTriangle, bootstrapTrash } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-delete-lesson-modal',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      bootstrapExclamationTriangle,
      bootstrapTrash,
    }),
  ],
  templateUrl: './delete-lesson-modal.component.html',
})
export class DeleteLessonModalComponent {
  lesson = input<AssistantLessonDto | null>(null);
  cancel = output<void>();
  confirm = output<void>();
}
