import { Component, input, output, signal } from '@angular/core';

import { fileTypeLabel, fileTypeIconClasses } from '../file-helpers';
import { Lesson, QueuedFile } from '../upload-page.types';
@Component({
  selector: 'app-lesson-upload-card',

  imports: [],
  templateUrl: './lesson-upload-card-component.html',
})
export class LessonUploadCardComponent {
  readonly lessons = input.required<Lesson[]>();
  readonly selectedLessonId = input<number | null>(null);
  readonly queueFiles = input<QueuedFile[]>([]);
  readonly isUploading = input(false);
  readonly canUpload = input(false);

  readonly lessonChange = output<number | null>();
  readonly filesAdded = output<File[]>();
  readonly queueItemRemoved = output<number>();
  readonly upload = output<void>();

  readonly fileTypeLabel = fileTypeLabel;
  readonly fileTypeIconClasses = fileTypeIconClasses;

  isDragOver = signal(false);

  onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.lessonChange.emit(value ? Number(value) : null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
     this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.filesAdded.emit(Array.from(files));
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.filesAdded.emit(Array.from(input.files));
    }
    input.value = '';
  }
}
