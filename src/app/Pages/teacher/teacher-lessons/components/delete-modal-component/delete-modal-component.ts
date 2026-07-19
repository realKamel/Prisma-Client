import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-delete-modal',
  imports: [],
  templateUrl: './delete-modal-component.html',
})
export class DeleteModalComponent {
   readonly lessonName = input<string>();
   readonly open = input<boolean>(false);
   readonly confirmed = output<void>();
   readonly cancelled = output<void>();
}
