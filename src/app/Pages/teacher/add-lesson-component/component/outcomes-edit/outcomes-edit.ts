import { Component, inject, input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { bootstrapStars, bootstrapXLg, bootstrapPlusLg } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-outcomes-add',
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './outcomes-edit.html',
  providers: [
    provideIcons({
      bootstrapStars,
      bootstrapXLg,
      bootstrapPlusLg,
    }),
  ],
})
export class OutcomesAdd implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Input Signals
  readonly outcomes = input.required<FormArray>();

  ngOnInit(): void {
    if (this.outcomes().length === 0) {
      this.add();
    }
  }

  add(): void {
    this.outcomes().push(this.fb.control(''));
  }

  remove(i: number): void {
    this.outcomes().removeAt(i);
  }

  asControl(c: AbstractControl): FormControl {
    return c as FormControl;
  }
}
