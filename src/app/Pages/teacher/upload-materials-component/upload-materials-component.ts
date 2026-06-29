import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { LessonUploadCardComponent } from './Component/lesson-upload-card-component/lesson-upload-card-component';
import { ExistingFilesCardComponent } from './Component/existing-files-card-component/existing-files-card-component';
import { formatFileSize, getFileType } from './Component/file-helpers';
import { Lesson, UploadedFile, FileFilter, QueuedFile } from './Component/upload-page.types';
import { UploadToastComponent } from './Component/upload-toast-component/upload-toast-component';
import { AppRole } from '../../../core/enums/role-enum';
import { AuthService } from '../../../core/Services/auth';
import { LessonMaterialsService } from '../../../core/Services/lesson-materials.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-lesson-upload-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LessonUploadCardComponent,
    ExistingFilesCardComponent,
    UploadToastComponent,
  ],
  templateUrl: './upload-materials-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LessonUploadPageComponent implements OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  public readonly auth = inject(AuthService);
  private readonly materialsService = inject(LessonMaterialsService);

  readonly lessons = toSignal(
    this.materialsService.getMyLessons().pipe(
      catchError(() => {
        toast.error('حدث خطأ أثناء تحميل الدروس');
        return of<Lesson[]>([]);
      })
    ),
    { initialValue: [] as Lesson[] }
  );

  selectedLessonId: number | null = null;
  currentFiles: UploadedFile[] = [];
  activeFilter: FileFilter = 'all';
  queueFiles: QueuedFile[] = [];
  isUploading = false;
  isLoadingFiles = false;
  toastMessage: string | null = null;

  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as AppRole | undefined;
  private toastTimeoutId?: ReturnType<typeof setTimeout>;

  get canUpload(): boolean {
    return this.queueFiles.length > 0 && this.selectedLessonId !== null;
  }

  onLessonChange(lessonId: number | null): void {
    this.selectedLessonId = lessonId;
    this.activeFilter = 'all';
    this.currentFiles = [];

    if (lessonId === null) return;

    this.isLoadingFiles = true;
    this.materialsService.getMaterials(lessonId).subscribe({
      next: (files) => {
        this.currentFiles = files;
        this.isLoadingFiles = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingFiles = false;
        toast.error('حدث خطأ أثناء تحميل الملفات');
        this.cdr.detectChanges();
      },
    });
  }

  onFilterChange(filter: FileFilter): void {
    this.activeFilter = filter;
  }

  onFilesAdded(files: File[]): void {
    const additions: QueuedFile[] = files.map((file) => ({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
    }));
    this.queueFiles = [...this.queueFiles, ...additions];
  }

  onQueueItemRemoved(index: number): void {
    this.queueFiles = this.queueFiles.filter((_, i) => i !== index);
  }

  upload(): void {
    if (!this.canUpload || this.selectedLessonId === null) return;

    const lessonId = this.selectedLessonId;
    const filesToUpload = [...this.queueFiles];
    this.isUploading = true;

    this.materialsService.uploadMaterials(lessonId, filesToUpload.map((f) => f.file)).subscribe({
      next: () => {
        this.queueFiles = [];
        this.isUploading = false;
        toast.success('تم رفع الملفات بنجاح');
        // reload from API to get real IDs + presigned URLs
        this.materialsService.getMaterials(lessonId).subscribe({
          next: (files) => {
            this.currentFiles = files;
            this.cdr.detectChanges();
          },
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.isUploading = false;
        toast.error('حدث خطأ أثناء رفع الملفات');
        this.cdr.detectChanges();
      },
    });
  }

  deleteFile(id: number): void {
    if (this.selectedLessonId === null) return;

    this.materialsService.deleteMaterial(this.selectedLessonId, id).subscribe({
      next: () => {
        this.currentFiles = this.currentFiles.filter((f) => f.id !== id);
        toast.success('تم حذف الملف');
        this.cdr.detectChanges();
      },
      error: () => {
        toast.error('حدث خطأ أثناء حذف الملف');
        this.cdr.detectChanges();
      },
    });
  }

  navigateToMyLessons(): void {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER) {
      this.router.navigate(['/dashboard/mylessons']);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimeoutId);
  }
}