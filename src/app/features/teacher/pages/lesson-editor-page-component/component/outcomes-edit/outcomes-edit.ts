import { Component, input, output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { bootstrapStars, bootstrapXLg, bootstrapPlusLg } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FieldError } from '../field-error/field-error';

@Component({
  selector: 'app-outcomes-edit',
  imports: [ReactiveFormsModule, NgIcon, FieldError],
  templateUrl: './outcomes-edit.html',
  viewProviders: [
    provideIcons({
      bootstrapStars,
      bootstrapXLg,
      bootstrapPlusLg,
    }),
  ],
})
export class OutcomesEdit {
  /** FormArray of outcome controls. The parent creates them (with validators) and seeds the first row. */
  readonly outcomes = input.required<FormArray>();

  readonly add = output<void>();
  readonly remove = output<number>();

  asControl(c: AbstractControl): FormControl {
    return c as FormControl;
  }
}