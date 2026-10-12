import { Component, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { bootstrapBook } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-lesson-info-section-add',
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './lesson-info-section-component.html',
  viewProviders: [
    provideIcons({
      bootstrapBook,
    }),
  ],
})
export class LessonInfoSectionAddComponent {
  public readonly form = input.required<FormGroup>();
  public readonly prerequisitesOptions = input<
    {
      id: number;
      name: string;
    }[]
  >([]);

  protected readonly validityUnTill = signal<Date>(new Date());

  protected updateDateValue(val: number) {
    const now = new Date();
    now.setDate(now.getDate() + val); // Adds the number of days to the current date
    this.validityUnTill.set(now);
  }
}
