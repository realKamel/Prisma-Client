import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { bootstrapTrash3, bootstrapTrash3Fill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { DeleteModalData } from './delete-modal.model';

@Component({
  imports: [NgIcon, NgmMotionDirective, TranslatePipe],
  viewProviders: [provideIcons({ bootstrapTrash3Fill, bootstrapTrash3 })],
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
})
export class DeleteModalComponent {
  // Inject DialogRef to control closing the modal and passing data back
  protected readonly dialogRef = inject(DialogRef<boolean>);
  // Inject DIALOG_DATA to read data passed into the modal
  protected readonly data = signal<DeleteModalData>(inject(DIALOG_DATA));
}
