import { Component, computed, input, output } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  bootstrapArrowRepeat,
  bootstrapCameraVideo,
  bootstrapCheckCircleFill,
  bootstrapCloudArrowUp,
  bootstrapExclamationTriangleFill,
  bootstrapFileEarmarkPlay,
  bootstrapPauseFill,
  bootstrapPlayFill,
  bootstrapPlusLg,
  bootstrapTrash3,
  bootstrapXCircleFill,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DurationPipe } from '../../../../../core/pipes/duration-pipe/duration-pipe';
import { FieldError } from '../../../lesson-editor-page-component/component/field-error/field-error';
import {
  ChapterVideoUpload,
  createChapterVideoUpload,
} from '../../models/chapter-video-upload.model';

/**
 * Presents chapter rows of the videos step. It owns no upload state: the page runs the
 * TUS uploads and feeds each row's progress back through the `uploads` input.
 */
@Component({
  selector: 'app-chapter-videos-step',
  imports: [ReactiveFormsModule, NgIcon, FieldError, DurationPipe],
  templateUrl: './chapter-videos-step.html',
  viewProviders: [
    provideIcons({
      bootstrapArrowRepeat,
      bootstrapCameraVideo,
      bootstrapCheckCircleFill,
      bootstrapCloudArrowUp,
      bootstrapExclamationTriangleFill,
      bootstrapFileEarmarkPlay,
      bootstrapPauseFill,
      bootstrapPlayFill,
      bootstrapPlusLg,
      bootstrapTrash3,
      bootstrapXCircleFill,
      bootstrapXLg,
    }),
  ],
})
export class ChapterVideosStepComponent {
  public readonly form = input.required<FormGroup>();
  public readonly uploads = input.required<ChapterVideoUpload[]>();
  /** Blocks every action, e.g. while the lesson is being created or uploaded. */
  public readonly locked = input(false);
  /** Blocks adding or removing chapters, e.g. once the lesson sections exist on the server. */
  public readonly structureLocked = input(false);

  public readonly add = output<void>();
  public readonly remove = output<number>();
  public readonly fileSelected = output<{ index: number; file: File }>();
  public readonly fileCleared = output<number>();
  public readonly pauseUpload = output<void>();
  public readonly resumeUpload = output<void>();
  public readonly cancelUpload = output<void>();

  protected readonly idleUpload = createChapterVideoUpload();

  protected readonly chapters = computed(() => this.form().get('chapters') as FormArray);

  protected asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  protected uploadAt(index: number): ChapterVideoUpload {
    return this.uploads()[index] ?? this.idleUpload;
  }

  protected onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.fileSelected.emit({ index, file });
  }

  protected isUploading(upload: ChapterVideoUpload): boolean {
    return upload.status === 'uploading' || upload.status === 'paused';
  }

  protected formatBytes(bytes: number): string {
    if (!bytes) return '0 م.ب';

    const megabytes = bytes / (1024 * 1024);
    if (megabytes < 1) return `${Math.max(1, Math.round(bytes / 1024))} ك.ب`;
    return `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} م.ب`;
  }
}
