import { Component, input } from '@angular/core';
import { bootstrapCheckCircle } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-lesson-toast',
  imports: [NgIcon],
  templateUrl: './lesson-toast.component.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckCircle,
    }),
  ],
})
export class LessonToastComponent {
  message = input<string>();
  visible = input<boolean>(false);
}
