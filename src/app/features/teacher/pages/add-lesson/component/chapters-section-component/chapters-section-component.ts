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

@Component({
  selector: 'app-chapters-section-add',
  imports: [ReactiveFormsModule, DecimalPipe, NgIcon],
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
export class ChaptersSectionAddComponent {
  /** FormArray of chapter groups: { name, videoFileName } */
  public readonly chapters = input.required<FormArray>();

  public readonly add = output<void>();

  public readonly remove = output<number>();

  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  videoFiles = new Map<number, File>();

  onChapterVideoChange(event: Event, chapter: FormGroup, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const guidId = crypto.randomUUID();

      const lastDotIndex = file.name.lastIndexOf('.');
      const ext = lastDotIndex !== -1 ? file.name.slice(lastDotIndex) : '';
      const guidFileName = `${guidId}${ext}`;
      const renamedFile = new File([file], guidFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });
      chapter.get('videoFileName')?.setValue(guidFileName);
      this.videoFiles.set(index, renamedFile);
    }
  }

  clearChapterVideo(chapter: FormGroup, input: HTMLInputElement, index: number): void {
    input.value = '';
    chapter.get('videoFileName')?.setValue(null);
    this.videoFiles.delete(index);
  }
}
