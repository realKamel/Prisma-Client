import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { bootstrapBook } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FieldError } from '../field-error/field-error';

@Component({
  selector: 'app-lesson-info-section',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    FieldError,
    NgSelectComponent,
    // NgLabelTemplateDirective,
    // NgOptionTemplateDirective,
  ],
  templateUrl: './lesson-info-section-component.html',
  styleUrl: './lesson-info-section-component.css',
  viewProviders: [
    provideIcons({
      bootstrapBook,
    }),
  ],
})
export class LessonInfoSectionComponent {
  public readonly form = input.required<FormGroup>();

  protected readonly currencies = [
    { name: 'جنيه مصري', code: 'EGP' },
    { name: 'دولار امريكي', code: 'USD' },
  ];

  public readonly prerequisitesOptions = input<
    {
      id: number;
      name: string;
    }[]
  >([]);
}
