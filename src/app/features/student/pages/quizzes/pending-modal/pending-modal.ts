import { Component, output, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
  selector: 'app-pending-modal',

  imports: [NgmMotionDirective],
  templateUrl: './pending-modal.html',
})
export class PendingModal {
  readonly visible = input(false);
  readonly close = output<void>();

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement) === event.currentTarget) {
      this.close.emit();
    }
  }
}
