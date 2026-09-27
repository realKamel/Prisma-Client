import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  bootstrapCameraVideo,
  bootstrapListUl,
  bootstrapPlusLg,
  bootstrapX,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FieldError } from '../field-error/field-error';

@Component({
  selector: 'app-chapters-section',
  imports: [ReactiveFormsModule, DecimalPipe, NgIcon, FieldError],
  templateUrl: './chapters-section-component.html',
  providers: [
    provideIcons({
      bootstrapListUl,
      bootstrapXLg,
      bootstrapCameraVideo,
      bootstrapX,
      bootstrapPlusLg,
    }),
  ],
})
export class ChaptersSectionComponent {
  /** FormArray of chapter groups: { name, videoFileName } */
  readonly chapters = input.required<FormArray>();

  readonly add = output<void>();
  readonly remove = output<number>();

  readonly videoFiles = new Map<string, File>();

  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  onChapterVideoChange(event: Event, chapter: FormGroup): void {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (!file) return;

    const previousName = chapter.get('videoFileName')?.value as string | null;
    if (previousName) this.videoFiles.delete(previousName);

    const dot = file.name.lastIndexOf('.');
    const ext = dot !== -1 ? file.name.slice(dot) : '';
    const generatedName = `${crypto.randomUUID()}${ext}`;

    this.videoFiles.set(
      generatedName,
      new File([file], generatedName, { type: file.type, lastModified: file.lastModified }),
    );
    chapter.get('videoFileName')?.setValue(generatedName);
  }

  clearChapterVideo(chapter: FormGroup, element: HTMLInputElement): void {
    const name = chapter.get('videoFileName')?.value as string | null;
    if (name) this.videoFiles.delete(name);

    element.value = '';
    chapter.get('videoFileName')?.setValue(null);
  }
}