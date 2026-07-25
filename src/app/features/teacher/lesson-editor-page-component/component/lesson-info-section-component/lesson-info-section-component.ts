import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { bootstrapBook } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-lesson-info-section',
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './lesson-info-section-component.html',
  viewProviders: [
    provideIcons({
      bootstrapBook,
    }),
  ],
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
