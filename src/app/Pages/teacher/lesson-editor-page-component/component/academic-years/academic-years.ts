import { Component, inject, input } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-academic-years',
  templateUrl: './academic-years.html',
})
export class AcademicYears {
  private readonly fb = inject(FormBuilder);

  // Input Signals
  readonly academicYears = input.required<{ id: number; name: string }[]>();
  readonly selectedYears = input.required<FormArray>();

  isSelected(id: number): boolean {
    return this.selectedYears().value.includes(id);
  }

  toggle(id: number): void {
    const index = this.selectedYears().value.indexOf(id);
    if (index === -1) {
      this.selectedYears().push(this.fb.control(id));
    } else {
      this.selectedYears().removeAt(index);
    }
  }
}
