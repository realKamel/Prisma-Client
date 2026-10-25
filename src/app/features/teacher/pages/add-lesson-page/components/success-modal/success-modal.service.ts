import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { SuccessModalComponent } from './success-modal.component';
import { SuccessModalData } from './success-modal.model';

@Service()
export class SuccessModalService {
  private readonly dialog = inject(Dialog);

  /** Opens the "lesson published" dialog; `closed` fires once the teacher dismisses it. */
  public openPublishSuccess(data: SuccessModalData = {}): DialogRef<void> {
    return this.dialog.open<void, SuccessModalData>(SuccessModalComponent, {
      data,
      ariaLabelledBy: 'success-title',
      ariaModal: true,
    });
  }
}
