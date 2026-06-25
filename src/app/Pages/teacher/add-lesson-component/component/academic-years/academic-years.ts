import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-academic-years-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './academic-years.html',
})
export class AcademicYearsAdd {
  @Input({ required: true }) academicYears!: { id: number; name: string }[];
  @Input({ required: true }) selectedYears!: FormArray;
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  isSelected(id: number): boolean {
    return this.selectedYears.value.includes(id);
  }

  toggle(id: number): void {
    const index = this.selectedYears.value.indexOf(id);
    if (index === -1) {
      this.selectedYears.push(this.fb.control(id));
    } else {
      this.selectedYears.removeAt(index);
    }
    this.cdr.detectChanges();
  }
}