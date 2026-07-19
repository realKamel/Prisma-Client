import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lesson-toast',

  templateUrl: './lesson-toast.component.html',
})
export class LessonToastComponent {
  message = input('');
  visible = input(false);
}
