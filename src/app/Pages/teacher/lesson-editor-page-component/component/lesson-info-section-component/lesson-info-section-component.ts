import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lesson-info-section',

  imports: [ReactiveFormsModule],
  templateUrl: './lesson-info-section-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LessonInfoSectionComponent {
  readonly form = input.required<FormGroup>();
  readonly prerequisitesOptions = input<
    {
      id: number;
      name: string;
    }[]
  >([]);
}
