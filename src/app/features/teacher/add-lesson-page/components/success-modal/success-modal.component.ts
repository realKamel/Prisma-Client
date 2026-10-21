import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  DEFAULT_SUCCESS_MESSAGE,
  DEFAULT_SUCCESS_TITLE,
  SuccessModalData,
} from './success-modal.model';

@Component({
  selector: 'app-success-modal',
  imports: [NgIcon, NgmMotionDirective],
  viewProviders: [provideIcons({ lucideCheck })],
  templateUrl: './success-modal.component.html',
})
export class SuccessModalComponent {
  protected readonly dialogRef = inject(DialogRef<void>);

  protected readonly data = signal<SuccessModalData>(inject(DIALOG_DATA) ?? {});
  protected readonly title = DEFAULT_SUCCESS_TITLE;
  protected readonly message = DEFAULT_SUCCESS_MESSAGE;
}
