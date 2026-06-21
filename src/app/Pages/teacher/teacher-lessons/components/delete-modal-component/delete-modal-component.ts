import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-modal-component.html',
})
export class DeleteModalComponent {
  @Input() lessonName = '';
  @Input() open = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}