import { Component, input, output, signal } from '@angular/core';
import {
  bootstrapChevronDown,
  bootstrapCloudArrowUp,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { fileTypeIconClasses, fileTypeLabel } from '../file-helpers';
import { Lesson, QueuedFile } from '../upload-page.types';
@Component({
  selector: 'app-lesson-upload-card',
  imports: [NgIcon],
  providers: [
    provideIcons({
      bootstrapChevronDown,
      bootstrapCloudArrowUp,
      bootstrapXLg,
    }),
  ],
  templateUrl: './lesson-upload-card-component.html',
})
export class LessonUploadCardComponent {
  public readonly lessons = input.required<Lesson[]>();
  public readonly selectedLessonId = input<number | null>(null);
  public readonly queueFiles = input<QueuedFile[]>([]);
  public readonly isUploading = input(false);
  public readonly canUpload = input(false);

  public readonly lessonChange = output<number | null>();
  public readonly filesAdded = output<File[]>();
  public readonly queueItemRemoved = output<number>();
  public readonly upload = output<void>();

  protected readonly fileTypeLabel = fileTypeLabel;
  protected readonly fileTypeIconClasses = fileTypeIconClasses;

  protected readonly isDragOver = signal(false);

  protected onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.lessonChange.emit(value ? Number(value) : null);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(): void {
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.filesAdded.emit(Array.from(files));
    }
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.filesAdded.emit(Array.from(input.files));
    }
    input.value = '';
  }
}
