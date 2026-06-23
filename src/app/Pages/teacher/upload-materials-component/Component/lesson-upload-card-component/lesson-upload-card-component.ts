import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fileTypeLabel, fileTypeIconClasses } from '../file-helpers';
import { Lesson, QueuedFile } from '../upload-page.types';
@Component({
  selector: 'app-lesson-upload-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-upload-card-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LessonUploadCardComponent {
  @Input({ required: true }) lessons!: Lesson[];
  @Input() selectedLessonId: number | null = null;
  @Input() queueFiles: QueuedFile[] = [];
  @Input() isUploading = false;
  @Input() canUpload = false;

  @Output() lessonChange = new EventEmitter<number | null>();
  @Output() filesAdded = new EventEmitter<File[]>();
  @Output() queueItemRemoved = new EventEmitter<number>();
  @Output() upload = new EventEmitter<void>();

  readonly fileTypeLabel = fileTypeLabel;
  readonly fileTypeIconClasses = fileTypeIconClasses;

  isDragOver = false;

  onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.lessonChange.emit(value ? Number(value) : null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
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