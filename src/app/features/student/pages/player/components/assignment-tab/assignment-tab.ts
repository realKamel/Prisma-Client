import { Component, computed, inject, input, output, signal } from '@angular/core';
import {
  bootstrapArrowRepeat,
  bootstrapCheckCircleFill,
  bootstrapCloudArrowUpFill,
  bootstrapExclamationTriangleFill,
  bootstrapFileEarmarkCheckFill,
  bootstrapShieldFillCheck,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { toast } from 'ngx-sonner';
import {
  Assignment,
  AssignmentSubmission,
} from '../../../../../../core/Models/Lesson/Lesson-Player';
import { LessonService } from '../../../../../../core/Services/lesson.service';

@Component({
  selector: 'app-assignment-tab',
  imports: [NgIcon],
  templateUrl: './assignment-tab.html',
  viewProviders: [
    provideIcons({
      bootstrapExclamationTriangleFill,
      bootstrapCloudArrowUpFill,
      bootstrapFileEarmarkCheckFill,
      bootstrapArrowRepeat,
      bootstrapCheckCircleFill,
      bootstrapShieldFillCheck,
    }),
  ],
})
export class AssignmentTab {
  private readonly lessonService = inject(LessonService);

  public readonly assignment = input<Assignment | null>(null);
  public readonly submission = input<AssignmentSubmission | null>(null);
  public readonly lessonId = input.required<number>();

  public readonly submitted = output<AssignmentSubmission>();
  public readonly deleted = output<void>();

  private readonly selectedFile = signal<File | null>(null);
  protected readonly isDragOver = signal(false);
  protected readonly isSubmitting = signal(false);

  // Single source of truth: a submission is only "done" if the backend says so,
  // never inferred from local component state alone.
  protected readonly isSubmitted = computed(() => this.submission() !== null);
  protected readonly hasFileSelected = computed(
    () => this.selectedFile() !== null || this.isSubmitted(),
  );
  protected readonly fileName = computed(
    () => this.selectedFile()?.name ?? this.submission()?.title ?? '',
  );

  protected readonly isDueDatePassed = computed(() => {
    const due = this.assignment()?.dueDate;
    if (!due) return false;
    return new Date(due).getTime() < Date.now();
  });

  protected onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(): void {
    this.isDragOver.set(false);
  }

  protected onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.selectedFile.set(file);
  }

  protected onFileBrowse(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.selectedFile.set(file);
  }

  protected submitAssignment(): void {
    const file = this.selectedFile();
    if (!file || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.lessonService.submitAssignment(this.lessonId(), file).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitted.emit({
          title: file.name,
          fileUrl: '',
          submittedAt: new Date().toISOString(),
          score: null,
          notes: null,
        });
        this.selectedFile.set(null);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Failed to submit assignment:', err);
        toast.error('حدث خطأ أثناء إرسال الواجب، حاول مرة أخرى');
      },
    });
  }

  protected resetUpload(): void {
    if (this.isDueDatePassed()) return;

    if (this.isSubmitted()) {
      this.lessonService.deleteAssignmentSubmission(this.lessonId()).subscribe({
        next: () => {
          this.deleted.emit();
          this.selectedFile.set(null);
        },
        error: (err) => {
          console.error('Failed to delete submission:', err);
          toast.error('تعذر حذف الملف المرفوع، حاول مرة أخرى');
        },
      });
      return;
    }

    this.selectedFile.set(null);
  }
}