import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { LessonUploadCardComponent } from './Component/lesson-upload-card-component/lesson-upload-card-component';
import { ExistingFilesCardComponent } from './Component/existing-files-card-component/existing-files-card-component';
import { formatFileSize, getFileType } from './Component/file-helpers';
import { MOCK_FILES_BY_LESSON } from './Component/mock-data';
import { Lesson, UploadedFile, FileFilter, QueuedFile } from './Component/upload-page.types';
import { UploadToastComponent } from './Component/upload-toast-component/upload-toast-component';
import { AppRole } from '../../../core/enums/role-enum';
import { AuthService } from '../../../core/Services/auth';
import { LessonMaterialsService } from '../../../core/Services/lesson-materials.service';

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
  public readonly auth = inject(AuthService);
  private readonly materialsService = inject(LessonMaterialsService);

  /** GET /api/v1/Teachers/lessons */
  readonly lessons = toSignal(
    this.materialsService.getMyLessons().pipe(
      catchError(() => {
        this.showToast('حدث خطأ أثناء تحميل الدروس');
        return of<Lesson[]>([]);
      })
    ),
    { initialValue: [] as Lesson[] }
  );

  /** TODO: replace this in-memory mock store with real API calls. */
  private readonly filesByLesson: Record<number, UploadedFile[]> = structuredClone(MOCK_FILES_BY_LESSON);

  selectedLessonId: number | null = null;
  currentFiles: UploadedFile[] = [];
  activeFilter: FileFilter = 'all';
  queueFiles: QueuedFile[] = [];
  isUploading = false;
  toastMessage: string | null = null;

  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as AppRole | undefined;

  private toastTimeoutId?: ReturnType<typeof setTimeout>;

  get canUpload(): boolean {
    return this.queueFiles.length > 0 && this.selectedLessonId !== null;
  }

  onLessonChange(lessonId: number | null): void {
    this.selectedLessonId = lessonId;
    this.activeFilter = 'all';
    this.currentFiles = lessonId !== null ? [...(this.filesByLesson[lessonId] ?? [])] : [];
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
    if (!this.canUpload || this.selectedLessonId === null) {
      return;
    }

    const lessonId = this.selectedLessonId;
    const filesToUpload = [...this.queueFiles];
    this.isUploading = true;

    this.materialsService
      .uploadMaterials(lessonId, filesToUpload.map((f) => f.file))
      .subscribe({
        next: () => {
          const existing = this.filesByLesson[lessonId] ?? [];
          const nextId = Math.max(0, ...existing.map((f) => f.id), 100) + 1;

          const uploaded: UploadedFile[] = filesToUpload.map((file, i) => ({
            id: nextId + i,
            name: file.name,
            type: file.type,
            size: file.size,
            date: 'منذ لحظات',
          }));

          this.filesByLesson[lessonId] = [...existing, ...uploaded];
          this.currentFiles = [...this.filesByLesson[lessonId]];
          this.queueFiles = [];
          this.isUploading = false;
          this.showToast('تم رفع الملفات بنجاح');
          this.cdr.detectChanges();
        },
        error: () => {
          this.isUploading = false;
          this.showToast('حدث خطأ أثناء رفع الملفات');
          this.cdr.detectChanges();
        },
      });
  }

  private cdr = inject(ChangeDetectorRef);

  navigateToMyLessons() {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER) {
      this.router.navigate(['/dashboard/mylessons']);
    }
  }

  deleteFile(id: number): void {
    if (this.selectedLessonId === null) {
      return;
    }
    this.currentFiles = this.currentFiles.filter((file) => file.id !== id);
    this.filesByLesson[this.selectedLessonId] = this.currentFiles;
    this.showToast('تم حذف الملف');
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimeoutId);
  }

  private showToast(message: string): void {
    clearTimeout(this.toastTimeoutId);
    this.toastMessage = message;
    this.toastTimeoutId = setTimeout(() => (this.toastMessage = null), 2600);
  }
}