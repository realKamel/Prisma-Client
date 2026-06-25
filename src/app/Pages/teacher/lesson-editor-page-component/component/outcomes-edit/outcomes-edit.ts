import { Component, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { } from '@angular/core';

@Component({
  selector: 'app-outcomes-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './outcomes-edit.html',
})
export class OutcomesEdit {
  @Input({ required: true }) outcomes!: FormArray;

  private cdr = inject(ChangeDetectorRef);
  ngDoCheck(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    if (this.outcomes.length === 0) {
      this.add();
    }
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

  constructor(private fb: FormBuilder) { }

  asControl(c: AbstractControl): FormControl {
    return c as FormControl;
  }
}