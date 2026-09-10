import { Component, output, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
  selector: 'app-confirm-modal',
  imports: [NgmMotionDirective],
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
