import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Assignment } from '../../../../../../core/Models/Lesson/Lesson-Player';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';
import { LessonService } from '../../../../../../core/Services/lesson.service';

@Component({
  selector: 'app-assignment-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignment-tab.html'
})
export class AssignmentTab implements OnInit {
  readonly assignment = input<Assignment | null>(null);
  readonly lessonId = input.required<number>();

  private lessonService = inject(LessonService);
  private currentFile: File | null = null;

  isDragOver = signal(false);
  hasFileSelected = signal(false);
  isSubmitted = signal(false);
  isSubmitting = signal(false);
  fileName = signal('');

  ngOnInit(): void {
    if (this.assignment()?.fileName) {
      this.fileName.set(this.assignment()!.fileName);
      this.isSubmitted.set(true);
    }
  }

  isDueDatePassed(): boolean {
    const dueDate = this.assignment()?.dueDate;
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
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
    if (event.dataTransfer?.files?.[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileBrowse(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    this.currentFile = file;
    this.fileName.set(file.name);
    this.hasFileSelected.set(true);
  }

  removeFile(): void {
    this.hasFileSelected.set(false);
    this.fileName.set('');
    this.currentFile = null;
  }

  submitAssignment(): void {
    if (!this.hasFileSelected() || !this.assignment()) return;
    this.isSubmitting.set(true);

    const file = this.currentFile!;
    toast.promise(
      firstValueFrom(this.lessonService.submitAssignment(this.lessonId(), file)),
      {
        loading: 'جاري إرسال الواجب...',
        success: () => {
          this.isSubmitted.set(true);
          this.isSubmitting.set(false);
          return 'تم تسليم الواجب بنجاح';
        },
        error: () => {
          this.isSubmitting.set(false);
          return 'فشل إرسال الواجب';
        }
      }
    );
  }

  resetUpload(): void {
    toast.promise(
      firstValueFrom(this.lessonService.deleteSubmission(this.lessonId())),
      {
        loading: 'جاري حذف التسليم...',
        success: () => {
          this.isSubmitted.set(false);
          this.removeFile();
          return 'تم حذف التسليم بنجاح';
        },
        error: 'فشل حذف التسليم'
      }
    );
  }
}