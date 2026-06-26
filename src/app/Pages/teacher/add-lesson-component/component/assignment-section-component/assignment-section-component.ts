import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-assignment-section-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assignment-section-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AssignmentSectionAddComponent {
  /** Root lesson-editor form. Only `assignmentEnabled`, `assignmentDescription`,
   * `assignmentDueDate`, and `assignmentFileTypes` controls are read here. */
  @Input({ required: true }) form!: FormGroup;

  @Output() toggle = new EventEmitter<void>();
}