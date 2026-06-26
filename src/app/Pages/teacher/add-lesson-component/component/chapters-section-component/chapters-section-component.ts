import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toAr } from '../to-ar';


@Component({
  selector: 'app-chapters-section-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chapters-section-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ChaptersSectionAddComponent {
  /** FormArray of chapter groups: { name, videoFileName } */
  @Input({ required: true }) chapters!: FormArray;

  @Output() add = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();

  readonly toAr = toAr;

  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  onChapterVideoChange(event: Event, chapter: FormGroup): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      chapter.get('videoFileName')?.setValue(file.name);
    }
  }

  clearChapterVideo(chapter: FormGroup, input: HTMLInputElement): void {
    input.value = '';
    chapter.get('videoFileName')?.setValue(null);
  }
}