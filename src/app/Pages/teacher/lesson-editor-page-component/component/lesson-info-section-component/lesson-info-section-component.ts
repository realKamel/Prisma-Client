import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lesson-info-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lesson-info-section-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LessonInfoSectionComponent {
  /** Root lesson-editor form. Only `title`, `description`, `price`,
   * `validityDays`, and `prerequisiteLessonId` controls are read here. */
  @Input({ required: true }) form!: FormGroup;
}