import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lesson-toast',
  standalone: true,
  templateUrl: './lesson-toast.component.html',
})
export class LessonToastComponent {
  message = input('');
  visible = input(false);
}
