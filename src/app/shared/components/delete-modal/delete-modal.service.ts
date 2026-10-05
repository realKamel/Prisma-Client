import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { DeleteModalComponent } from './delete-modal.component';
import { DeleteModalData } from './delete-modal.model';

@Service()
export class DeleteModalService {
  private readonly dialog = inject(Dialog);

  public confirmDelete(itemName: string, message?: string): DialogRef<boolean> {
    return this.dialog.open<boolean, DeleteModalData>(DeleteModalComponent, {
      data: { title: itemName, message },
      // backdropClass: ['bg-main/10', 'fixed', 'inset-0', 'z-50', 'backdrop-blur-xs'],
      // panelClass: ['flex', 'items-center', 'justify-center', 'w-full', 'h-full'],
    });
  }
}
