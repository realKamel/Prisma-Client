import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lesson-info-section-add',

  imports: [ReactiveFormsModule],
  templateUrl: './lesson-info-section-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LessonInfoSectionAddComponent {
  readonly form = input.required<FormGroup>();
  readonly prerequisitesOptions = input<
    {
      id: number;
      name: string;
    }[]
  >([]);
}
