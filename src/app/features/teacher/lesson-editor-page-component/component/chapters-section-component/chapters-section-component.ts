import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, output } from '@angular/core';
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

  private readonly cdr = inject(ChangeDetectorRef);

  async onChapterVideoChange(event: Event, chapter: FormGroup): Promise<void> {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (!file) return;

    const previousName = chapter.get('videoFileName')?.value as string | null;
    if (previousName) this.videoFiles.delete(previousName);

    const dot = file.name.lastIndexOf('.');
    const ext = dot !== -1 ? file.name.slice(dot) : '';
    const generatedName = `${crypto.randomUUID()}${ext}`;

    let duration: number;
    try {
      duration = await this.getVideoDuration(file);
    } catch {
      duration = 0; 
    }

    this.videoFiles.set(
      generatedName,
      new File([file], generatedName, { type: file.type, lastModified: file.lastModified }),
    );
    chapter.get('videoFileName')?.setValue(generatedName);
    chapter.get('videoDurationSeconds')?.setValue(duration); 

    this.cdr.markForCheck();
  }

getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.src = url;

    const timer = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error(`Timed out reading metadata for ${file.name}`));
    }, 15_000);

    const cleanup = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      cleanup();
      resolve(video.duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error(`Could not read metadata for ${file.name}`));
    };
  });
}

  clearChapterVideo(chapter: FormGroup, element: HTMLInputElement): void {
    const name = chapter.get('videoFileName')?.value as string | null;
    if (name) this.videoFiles.delete(name);

    element.value = '';
    chapter.get('videoFileName')?.setValue(null);
  }
}