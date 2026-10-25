import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { bootstrapArrowRight } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/Services/auth';
import { LessonMaterialsService } from '../../../../core/Services/lesson-materials.service';
import { AppRole } from '../../../../core/enums/role-enum';
import { ExistingFilesCardComponent } from './Component/existing-files-card-component/existing-files-card-component';
import { formatFileSize, getFileType } from './Component/file-helpers';
import { LessonUploadCardComponent } from './Component/lesson-upload-card-component/lesson-upload-card-component';
import { FileFilter, Lesson, QueuedFile, UploadedFile } from './Component/upload-page.types';
import { UploadToastComponent } from './Component/upload-toast-component/upload-toast-component';

@Component({
  selector: 'app-lesson-upload-page',
  imports: [
    LessonUploadCardComponent,
    ExistingFilesCardComponent,
    UploadToastComponent,
    NgIcon,
    NgmMotionDirective,
  ],
  viewProviders: [provideIcons({ bootstrapArrowRight })],
  templateUrl: './upload-materials-component.html',
})
export class LessonUploadPageComponent {
  private readonly router = inject(Router);
  public readonly auth = inject(AuthService);
  private readonly materialsService = inject(LessonMaterialsService);

  // Read-only Streams converted directly to Signals
  protected readonly lessons = toSignal(
    this.materialsService.getMyLessons().pipe(
      catchError((error) => {
        console.log(error);
        toast.error('حدث خطأ أثناء تحميل الدروس');
        return of<Lesson[]>([]);
      }),
    ),
    { initialValue: [] as Lesson[] },
  );

  // Core View State Management Signals
  protected readonly selectedLessonId = signal<number | null>(null);
  protected readonly currentFiles = signal<UploadedFile[]>([]);
  protected readonly activeFilter = signal<FileFilter>('all');
  protected readonly queueFiles = signal<QueuedFile[]>([]);
  protected readonly isUploading = signal(false);
  protected readonly isLoadingFiles = signal(false);
  protected readonly toastMessage = signal<string | null>(null);

  // Derived Reactive Properties (Replaces old getter)
  protected readonly canUpload = computed(() => {
    return this.queueFiles().length > 0 && this.selectedLessonId() !== null;
  });

  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as
    AppRole | undefined;

  constructor() {
    // Clean, auto-disposing timer side effects using standard Signals hook
    effect((onCleanup) => {
      const currentMessage = this.toastMessage();
      if (currentMessage) {
        const timer = setTimeout(() => {
          this.toastMessage.set(null);
        }, 5000); // Kept custom message timeout interval baseline

        onCleanup(() => clearTimeout(timer));
      }
    });
  }

  protected onLessonChange(lessonId: number | null): void {
    this.selectedLessonId.set(lessonId);
    this.activeFilter.set('all');
    this.currentFiles.set([]);

    if (lessonId === null) return;

    this.isLoadingFiles.set(true);
    this.materialsService.getMaterials(lessonId).subscribe({
      next: (files) => {
        this.currentFiles.set(files);
        this.isLoadingFiles.set(false);
      },
      error: () => {
        this.isLoadingFiles.set(false);
        toast.error('حدث خطأ أثناء تحميل الملفات');
      },
    });
  }

  protected onFilterChange(filter: FileFilter): void {
    this.activeFilter.set(filter);
  }

  protected onFilesAdded(files: File[]): void {
    const additions: QueuedFile[] = files.map((file) => ({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
    }));
    this.queueFiles.update((current) => [...current, ...additions]);
  }

  protected onQueueItemRemoved(index: number): void {
    this.queueFiles.update((current) => current.filter((_, i) => i !== index));
  }

  protected upload(): void {
    const lessonId = this.selectedLessonId();
    if (!this.canUpload() || lessonId === null) return;

    const filesToUpload = [...this.queueFiles()];
    this.isUploading.set(true);

    this.materialsService
      .uploadMaterials(
        lessonId,
        filesToUpload.map((f) => f.file),
      )
      .subscribe({
        next: () => {
          this.queueFiles.set([]);
          this.isUploading.set(false);
          toast.success('تم رفع الملفات بنجاح');

          // Reload fresh assets from core API layer
          this.materialsService.getMaterials(lessonId).subscribe({
            next: (files) => this.currentFiles.set(files),
          });
        },
        error: () => {
          this.isUploading.set(false);
          toast.error('حدث خطأ أثناء رفع الملفات');
        },
      });
  }

  protected deleteFile(id: number): void {
    const lessonId = this.selectedLessonId();
    if (lessonId === null) return;

    this.materialsService.deleteMaterial(lessonId, id).subscribe({
      next: () => {
        this.currentFiles.update((files) => files.filter((f) => f.id !== id));
        toast.success('تم حذف الملف');
      },
      error: () => {
        toast.error('حدث خطأ أثناء حذف الملف');
      },
    });
  }

  protected navigateToMyLessons(): void {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      void this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER || this.normalizedRole === AppRole.ADMIN) {
      void this.router.navigate(['/dashboard/mylessons']);
    }
  }
}
