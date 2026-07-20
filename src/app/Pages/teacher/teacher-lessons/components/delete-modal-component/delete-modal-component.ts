import { Component, input, output } from '@angular/core';
import { bootstrapTrash3, bootstrapTrash3Fill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-delete-modal',
  imports: [NgIcon],
  templateUrl: './delete-modal-component.html',
  viewProviders: [
    provideIcons({
      bootstrapTrash3,
      bootstrapTrash3Fill,
    }),
  ],
})
export class DeleteModalComponent {
  readonly lessonName = input<string>();
  readonly open = input<boolean>(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
