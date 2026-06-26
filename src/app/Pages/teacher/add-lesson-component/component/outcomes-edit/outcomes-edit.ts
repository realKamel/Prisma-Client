import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-outcomes-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './outcomes-edit.html',
})
export class OutcomesAdd {
  @Input({ required: true }) outcomes!: FormArray;
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (this.outcomes.length === 0) this.add();
  }

  ngDoCheck(): void {
    this.cdr.detectChanges();
  }

  add(): void {
    this.outcomes.push(this.fb.control(''));
    this.cdr.detectChanges();
  }

  remove(i: number): void {
    this.outcomes.removeAt(i);
    this.cdr.detectChanges();
  }

  asControl(c: AbstractControl): FormControl {
    return c as FormControl;
  }
}