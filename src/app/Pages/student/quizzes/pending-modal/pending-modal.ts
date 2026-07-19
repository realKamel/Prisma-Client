import { Component, output, input } from '@angular/core';

@Component({
  selector: 'app-pending-modal',

  imports: [],
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
