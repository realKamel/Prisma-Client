import { Component, inject, input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-outcomes-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './outcomes-edit.html',
})
export class OutcomesEdit implements OnInit {
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
