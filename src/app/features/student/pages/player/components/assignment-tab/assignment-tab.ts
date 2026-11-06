import { Component, computed, inject, input, output, signal } from '@angular/core';
import {
  bootstrapArrowRepeat,
  bootstrapAwardFill,
  bootstrapBoxArrowUpRight,
  bootstrapChatLeftTextFill,
  bootstrapCheckCircleFill,
  bootstrapCloudArrowUpFill,
  bootstrapExclamationTriangleFill,
  bootstrapFileEarmarkCheckFill,
  bootstrapFileEarmarkTextFill,
  bootstrapLockFill,
  bootstrapShieldFillCheck,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { toast } from 'ngx-sonner';
import {
  Assignment,
  AssignmentSubmission,
} from '../../../../../../domain/lessons/models/Lesson-player.model';
import { LessonService } from '../../../../../../domain/lessons/services/lesson.service';
import { DatePipe } from '@angular/common';

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

@Component({
  selector: 'app-assignment-tab',
  imports: [NgIcon, DatePipe],
  templateUrl: './assignment-tab.html',
  viewProviders: [
    provideIcons({
      bootstrapExclamationTriangleFill,
      bootstrapCloudArrowUpFill,
      bootstrapFileEarmarkCheckFill,
      bootstrapArrowRepeat,
      bootstrapCheckCircleFill,
      bootstrapShieldFillCheck,
      bootstrapBoxArrowUpRight,
      bootstrapFileEarmarkTextFill,
      bootstrapAwardFill,
      bootstrapChatLeftTextFill,
      bootstrapLockFill,

    }),
  ],
})
export class AssignmentTab {
  private readonly lessonService = inject(LessonService);

  protected readonly acceptAttr = [...ALLOWED_EXTENSIONS, ...ALLOWED_MIME_TYPES].join(',');

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
  // `!!grade` would treat a legitimate grade of 0 as "not graded", so check null/undefined.
  protected readonly isGraded = computed(() => {
    const grade = this.assignment()?.submissionGrade;
    return grade !== null && grade !== undefined;
  });
  protected readonly isDueDatePassed = computed(() => {
    const due = this.assignment()?.dueDate;
    if (!due) return false;
    return new Date(due).getTime() < Date.now();
  });

  // No changes allowed once graded, or once the deadline passed on an existing submission.
  // (A student who never submitted can still submit late.)
  protected readonly isLocked = computed(
    () => this.isGraded() || (this.isSubmitted() && this.isDueDatePassed()),
  );
  protected readonly hasContentUrl = computed(() => !!this.assignment()?.contentURL);

  protected openAssignmentFile(): void {
    const url = this.assignment()?.contentURL;
    if (!url) {
      toast.error('ملف الواجب غير متاح حالياً');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

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
    this.trySelect(e.dataTransfer?.files?.[0]);
  }

  protected onFileBrowse(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.trySelect(input.files?.[0]);
    input.value = '';
  }
  private isAllowed(file: File): boolean {
    const name = file.name.toLowerCase();
    const extensionOk = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
    const typeOk = !file.type || ALLOWED_MIME_TYPES.includes(file.type);
    return extensionOk && typeOk;
  }

  private trySelect(file: File | undefined): void {
    if (!file || this.isLocked()) return;

    if (!this.isAllowed(file)) {
      toast.error('نوع الملف غير مدعوم. الصيغ المسموحة: PDF أو JPG أو PNG');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`حجم الملف كبير جداً. الحد الأقصى ${MAX_FILE_SIZE_MB} ميجابايت`);
      return;
    }

    this.selectedFile.set(file);
  }

  protected submitAssignment(): void {
    const file = this.selectedFile();
    if (!file || this.isSubmitting() || this.isLocked()) return;

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
    if (this.isLocked()) return;

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