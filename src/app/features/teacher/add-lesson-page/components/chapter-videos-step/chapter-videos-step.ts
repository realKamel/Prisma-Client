import { Component, input, output } from '@angular/core';
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
import { ChapterRow } from '../../models/chapter-row.model';
import { ChapterVideoUpload } from '../../models/chapter-video-upload.model';

/**
 * Presents the chapters of the videos step. It owns no form and no upload state: the page
 * keeps a plain `ChapterRow[]` signal, runs the TUS uploads and feeds progress back in.
 */
@Component({
  selector: 'app-chapter-videos-step',
  imports: [NgIcon, DurationPipe],
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
  public readonly rows = input.required<ChapterRow[]>();
  /** Set by the page when a publish attempt found invalid chapter titles. */
  public readonly showErrors = input(false);
  /** Blocks every action, e.g. while the lesson is being created or uploaded. */
  public readonly locked = input(false);
  /** Blocks adding or removing chapters, e.g. once the lesson sections exist on the server. */
  public readonly structureLocked = input(false);

  public readonly add = output<void>();
  public readonly remove = output<number>();
  public readonly renamed = output<{ index: number; name: string }>();
  public readonly fileSelected = output<{ index: number; file: File }>();
  public readonly fileCleared = output<number>();
  public readonly pauseUpload = output<void>();
  public readonly resumeUpload = output<void>();
  public readonly cancelUpload = output<void>();

  protected onNameInput(event: Event, index: number): void {
    const value = (event.target as HTMLInputElement).value;
    this.renamed.emit({ index, name: value });
  }

  protected onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.fileSelected.emit({ index, file });
  }

  protected isTitleMissing(row: ChapterRow): boolean {
    return this.showErrors() && !row.name.trim();
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
