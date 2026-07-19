import { Component, output, input } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
})
export class ConfirmModal {
  readonly visible = input(false);
  readonly title = input('تأكيد التسليم');
  readonly message = input('متأكد/ة إنك عايزة تسلم/ي الاختبار؟');
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement) === event.currentTarget) {
      this.cancel.emit();
    }
  }
}
