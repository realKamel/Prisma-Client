import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toAr } from '../to-ar';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-chapters-section',
  imports: [ReactiveFormsModule,DecimalPipe],
  templateUrl: './chapters-section-component.html',
})
export class ChaptersSectionComponent {
  /** FormArray of chapter groups: { name, videoFileName } */
  readonly chapters = input.required<FormArray>();

  readonly add = output<void>();
  readonly remove = output<number>();

  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  videoFiles = new Map<number, File>();

  onChapterVideoChange(event: Event, chapter: FormGroup, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      chapter.get('videoFileName')?.setValue(file.name);
      this.videoFiles.set(index, file);
    }
  }

  clearChapterVideo(chapter: FormGroup, input: HTMLInputElement, index: number): void {
    input.value = '';
    chapter.get('videoFileName')?.setValue(null);
    this.videoFiles.delete(index);
  }
}
