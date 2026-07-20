import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pending-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pending-modal.html',
})
export class PendingModal {
    @Input() visible = false;
    @Output() close = new EventEmitter<void>();

    onOverlayClick(event: MouseEvent): void {
        if ((event.target as HTMLElement) === event.currentTarget) {
            this.close.emit();
        }
    }
}