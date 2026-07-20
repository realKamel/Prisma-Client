import { Component, inject, input } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { bootstrapCheck2Circle, bootstrapCircle } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGraduationCap } from '@ng-icons/lucide';

@Component({
  selector: 'app-academic-years',
  templateUrl: './academic-years.html',
  imports: [NgIcon],
  viewProviders: [provideIcons({ lucideGraduationCap, bootstrapCheck2Circle, bootstrapCircle })],
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
