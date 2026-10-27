import { Component, input, output } from '@angular/core';
import {
  bootstrapArrowRepeat,
  bootstrapCameraVideo,
  bootstrapCheckCircleFill,
  bootstrapCloudArrowUp,
  bootstrapExclamationCircle,
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
import { DurationPipe } from '../../../../../../shared/pipes/duration/duration-pipe';
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
      bootstrapExclamationCircle,
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
  /** Blocks adding or removing chapters, e.g. once the lesson exists on the server. */
  public readonly structureLocked = input(false);
  /** Row whose section is being created right now, if any. */
  public readonly creatingSection = input<number | null>(null);
  /** Row whose video upload the page started right now, if any. */
  public readonly uploadingRow = input<number | null>(null);

  public readonly add = output<void>();
  public readonly remove = output<number>();
  public readonly renamed = output<{ index: number; name: string }>();
  public readonly createSection = output<number>();
  public readonly fileSelected = output<{ index: number; file: File }>();
  public readonly fileCleared = output<number>();
  public readonly startUpload = output<number>();
  public readonly pauseUpload = output<number>();
  public readonly resumeUpload = output<number>();
  public readonly cancelUpload = output<number>();

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

  /**
   * A section must exist before the video can be uploaded against it. Earlier chapters must be
   * created first because the backend assigns `sectionSortOrder` in creation order.
   */
  protected canCreateSection(index: number): boolean {
    const row = this.rows()[index];

    return (
      !!row &&
      row.sectionId === null &&
      !this.locked() &&
      this.creatingSection() === null &&
      !this.sectionBlockedByOrder(index)
    );
  }

  /** True while an earlier chapter has no section yet, i.e. creating this one would reorder them. */
  protected sectionBlockedByOrder(index: number): boolean {
    return this.rows()
      .slice(0, index)
      .some((previous) => previous.sectionId === null);
  }

  protected isCreatingSection(index: number): boolean {
    return this.creatingSection() === index;
  }

  protected canStart(row: ChapterRow): boolean {
    const { upload } = row;
    return (
      row.sectionId !== null &&
      !!upload.file &&
      upload.status !== 'done' &&
      upload.status !== 'uploading' &&
      upload.status !== 'paused' &&
      !this.locked()
    );
  }

  protected canPause(row: ChapterRow): boolean {
    return row.upload.status === 'uploading';
  }

  protected canResume(row: ChapterRow): boolean {
    return row.upload.status === 'paused';
  }

  protected canCancel(row: ChapterRow): boolean {
    return row.upload.status === 'uploading' || row.upload.status === 'paused';
  }

  /** Headline above the progress bar, so the bar always says what it measures. */
  protected progressLabel(row: ChapterRow): string {
    if (!row.sectionId) return 'بانتظار إنشاء القسم';
    if (row.upload.status === 'done') return 'تم رفع الفيديو بنجاح';
    if (row.upload.status === 'paused') return 'الرفع متوقف مؤقتًا';
    if (row.upload.status === 'uploading') return 'جاري رفع الفيديو...';
    if (row.upload.status === 'error') return 'توقف الرفع بسبب خطأ';
    return 'جاهز للرفع';
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
