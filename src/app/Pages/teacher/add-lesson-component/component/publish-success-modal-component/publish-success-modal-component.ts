import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-publish-success-modal-add',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './publish-success-modal-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PublishSuccessModalAddComponent {
  @Input() open = false;

  @Output() closed = new EventEmitter<void>();
}