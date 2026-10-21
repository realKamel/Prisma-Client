import { CdkStepperModule } from '@angular/cdk/stepper';
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  bootstrapArrowLeft,
  bootstrapArrowRight,
  bootstrapBook,
  bootstrapCameraVideo,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';
import { AppRole } from '../../../core/enums/role-enum';
import { AuthService } from '../../../core/Services/auth';
import { LessonService } from '../../../core/Services/lesson.service';
import { TeachersService } from '../../../core/Services/teachers.service';
import { VideoUploadStatus } from '../../common/services/videos-service/videos.models';
import { VideosService } from '../../common/services/videos-service/videos.service';
import { AcademicYears } from '../lesson-editor-page-component/component/academic-years/academic-years';
import { AssignmentSectionComponent } from '../lesson-editor-page-component/component/assignment-section-component/assignment-section-component';
import { ImageUpload } from '../lesson-editor-page-component/component/image-upload/image-upload';
import { LessonInfoSectionComponent } from '../lesson-editor-page-component/component/lesson-info-section-component/lesson-info-section-component';
import { OutcomesEdit } from '../lesson-editor-page-component/component/outcomes-edit/outcomes-edit';
import { PublishSuccessModalComponent } from '../lesson-editor-page-component/component/publish-success-modal-component/publish-success-modal-component';
import { requiredText } from '../lesson-editor-page-component/component/Utils/form-errors';
import { ChapterVideosStepComponent } from './components/chapter-videos-step/chapter-videos-step';
import { LessonStepperComponent } from './components/lesson-stepper/lesson-stepper';
import { ChapterRow, createChapterRow } from './models/chapter-row.model';
import {
  ChapterVideoStatus,
  ChapterVideoUpload,
  createChapterVideoUpload,
} from './models/chapter-video-upload.model';
import { readVideoDuration } from './utils/video-duration';

/**
 * Two-step lesson creation: lesson details first, chapter videos second.
 * The lesson is saved (with its sections) before the videos are uploaded to Bunny Stream,
 * then every uploaded video is linked to the section it belongs to.
 */
@Component({
  selector: 'app-add-lesson-page',
  imports: [
    ReactiveFormsModule,
    CdkStepperModule,
    NgIcon,
    NgmMotionDirective,
    LessonStepperComponent,
    ChapterVideosStepComponent,
    LessonInfoSectionComponent,
    ImageUpload,
    AcademicYears,
    OutcomesEdit,
    AssignmentSectionComponent,
    PublishSuccessModalComponent,
  ],
  templateUrl: './add-lesson-page.component.html',
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
      bootstrapArrowRight,
      bootstrapBook,
      bootstrapCameraVideo,
    }),
  ],
})
export class AddLessonPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly lessonService = inject(LessonService);
  private readonly teacherService = inject(TeachersService);
  private readonly videosService = inject(VideosService);
  private readonly auth = inject(AuthService);

  private readonly stepper = viewChild.required(LessonStepperComponent);

  protected readonly detailsForm: FormGroup = this.fb.group({
    info: this.fb.group({
      title: ['', [requiredText, Validators.minLength(5)]],
      description: [''],
      price: [null as number | null, [Validators.required, Validators.min(0)]],
      currency: ['EGP' as string | null, [Validators.required]],
      prerequisiteLessonId: [null as number | null],
      validityDurationInSeconds: [null as number | null, [Validators.required, Validators.min(0)]],
    }),
    outcomes: this.fb.array([this.createOutcomeControl()], Validators.required),
    academicYearIds: this.fb.array([], Validators.required),
    assignment: this.fb.group({
      assignmentEnabled: [false],
      assignmentDueDate: [null as string | null],
      assignmentFileName: [null as string | null],
    }),
  });

  protected readonly publishing = signal(false);
  protected readonly isSuccessOpen = signal(false);
  protected readonly prerequisitesOptions = signal<{ id: number; name: string }[]>([]);
  protected readonly allAcademicYears = signal<{ id: number; name: string }[]>([]);
  protected readonly chapterRows = signal<ChapterRow[]>([createChapterRow()]);
  /** Turns on the per-row title errors after a publish attempt with empty titles. */
  protected readonly showChapterErrors = signal(false);
  /** Index of the chapter whose TUS upload feeds the progress signals right now. */
  protected readonly activeUploadIndex = signal<number | null>(null);

  /** Set once the lesson (and its sections) exist, so a retry only uploads and attaches. */
  private readonly createdLessonId = signal<number | null>(null);
  private sectionIds: number[] = [];

  protected readonly structureLocked = computed(() => this.createdLessonId() !== null);

  private thumbnailFile: File | null = null;
  private assignmentFile: File | null = null;

  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as
    AppRole | undefined;

  constructor() {
    this.detailsForm
      .get('assignment.assignmentEnabled')!
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe((enabled: boolean) => this.applyAssignmentValidators(!!enabled));

    // Mirrors the single active TUS upload into the row it belongs to.
    effect(() => {
      const index = this.activeUploadIndex();
      if (index === null) return;

      const status = this.toChapterStatus(this.videosService.status());
      const serviceError = this.videosService.error();

      this.patchUpload(index, {
        progress: this.videosService.progress(),
        bytesUploaded: this.videosService.bytesUploaded(),
        bytesTotal: this.videosService.bytesTotal(),
        status,
        error: status === 'error' ? (serviceError ?? 'تعذّر رفع الفيديو.') : null,
      });
    });
  }

  protected get outcomes(): FormArray {
    return this.detailsForm.get('outcomes') as FormArray;
  }

  protected get academicYearIds(): FormArray {
    return this.detailsForm.get('academicYearIds') as FormArray;
  }

  private get assignmentGroup(): FormGroup {
    return this.detailsForm.get('assignment') as FormGroup;
  }

  public ngOnInit(): void {
    this.lessonService.getLessonFormOptions().subscribe({
      next: (res) => this.prerequisitesOptions.set(res.prerequisitesOptions),
    });

    this.teacherService.getTeacherAcademicYears().subscribe({
      next: (res) => this.allAcademicYears.set(res),
    });
  }

  public ngOnDestroy(): void {
    // Never leave a TUS upload running once the page is gone.
    this.videosService.reset();
  }

  // ─────────────────────────── form helpers ───────────────────────────

  private createOutcomeControl(value = ''): FormControl<string | null> {
    return this.fb.control(value, requiredText);
  }

  private applyAssignmentValidators(enabled: boolean): void {
    for (const name of ['assignmentDueDate', 'assignmentFileName']) {
      const control = this.assignmentGroup.get(name)!;
      if (enabled) {
        control.setValidators(Validators.required);
      } else {
        control.clearValidators();
      }
      control.updateValueAndValidity();
    }
  }

  protected addChapter(): void {
    if (this.structureLocked()) return;
    this.chapterRows.update((rows) => [...rows, createChapterRow()]);
  }

  protected removeChapter(index: number): void {
    if (this.chapterRows().length <= 1 || this.structureLocked()) return;
    this.chapterRows.update((rows) => rows.filter((_, i) => i !== index));
  }

  protected onChapterRenamed(event: { index: number; name: string }): void {
    this.patchChapter(event.index, { name: event.name });
  }

  protected async onChapterFileSelected(event: { index: number; file: File }): Promise<void> {
    const { index, file } = event;

    if (!file.type.startsWith('video/')) {
      toast.error('الملف المختار ليس فيديو.');
      return;
    }

    const durationSeconds = await readVideoDuration(file);
    this.patchUpload(index, {
      file,
      durationSeconds,
      status: 'ready',
      progress: 0,
      bytesUploaded: 0,
      bytesTotal: file.size,
      videoId: null,
      attached: false,
      error: null,
    });
  }

  protected onChapterFileCleared(index: number): void {
    if (this.chapterRows()[index]?.upload.status === 'done') return;
    this.patchUpload(index, createChapterVideoUpload());
  }

  protected addOutcome(): void {
    this.outcomes.push(this.createOutcomeControl());
  }

  protected removeOutcome(index: number): void {
    this.outcomes.removeAt(index);
  }

  protected onThumbnailSelected(file: File | null): void {
    this.thumbnailFile = file;
  }

  protected onAssignmentToggle(): void {
    const control = this.assignmentGroup.get('assignmentEnabled')!;
    control.setValue(!control.value);
  }

  protected onAssignmentFileSelected(file: File | null): void {
    this.assignmentFile = file;
    const control = this.assignmentGroup.get('assignmentFileName')!;
    control.setValue(file ? file.name : null);
    control.markAsTouched(); // the file input isn't bound to the control, so nothing else touches it
  }

  // ─────────────────────────── navigation ───────────────────────────

  protected goToVideos(): void {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      toast.error('يرجى استكمال بيانات الدرس بشكل صحيح للمتابعة.');
      return;
    }

    this.stepper().next();
  }

  protected goBackToDetails(): void {
    if (this.publishing()) return;
    this.stepper().previous();
  }

  protected cancel(): void {
    if (this.publishing()) return;
    this.navigateToMyLessons();
  }

  protected closeSuccess(): void {
    this.isSuccessOpen.set(false);
    this.navigateToMyLessons();
  }

  private navigateToMyLessons(): void {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      void this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER || this.normalizedRole === AppRole.ADMIN) {
      void this.router.navigate(['/dashboard/mylessons']);
    }
  }

  // ─────────────────────────── publishing ───────────────────────────

  protected publish(): void {
    if (this.publishing()) return;

    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      this.stepper().selectedIndex = 0;
      toast.error('يرجى استكمال بيانات الدرس بشكل صحيح قبل النشر.');
      return;
    }

    const videosProblem = this.validateVideos();
    if (videosProblem) {
      this.showChapterErrors.set(true);
      this.stepper().selectedIndex = 1;
      toast.error(videosProblem);
      return;
    }

    this.showChapterErrors.set(false);

    this.publishing.set(true);
    this.stepper().selectedIndex = 1;

    // A previous attempt already created the lesson, so only the missing videos are uploaded.
    if (this.createdLessonId() !== null) {
      void this.uploadVideos();
      return;
    }

    this.lessonService.addLesson(this.buildFormData()).subscribe({
      next: (res) => {
        this.createdLessonId.set(res.lessonId);
        this.sectionIds = res.sectionIds;
        void this.uploadVideos();
      },
      error: () => {
        this.publishing.set(false);
        toast.error('تعذّر حفظ الدرس، حاول مرة أخرى.');
      },
    });
  }

  private validateVideos(): string | null {
    const rows = this.chapterRows();
    if (rows.length === 0) return 'أضف فصلًا واحدًا على الأقل.';

    const missingTitle = rows.findIndex((row) => !row.name.trim());
    if (missingTitle !== -1) return `اكتب عنوانًا للفصل ${missingTitle + 1}.`;

    const missingVideo = rows.findIndex((row) => !row.upload.file && row.upload.status !== 'done');
    if (missingVideo !== -1) return `اختر فيديو للفصل ${missingVideo + 1}.`;

    return null;
  }

  /** Uploads every pending chapter video sequentially; the TUS service holds a single upload. */
  private async uploadVideos(): Promise<void> {
    this.videosService.reset();

    for (let index = 0; index < this.chapterRows().length; index++) {
      const upload = this.chapterRows()[index].upload;
      const sectionId = this.sectionIds[index];

      if (!upload.file || upload.status === 'done') continue;

      if (sectionId === undefined) {
        this.publishing.set(false);
        this.patchUpload(index, {
          status: 'error',
          error: 'لم يتم إنشاء فصل لهذا الفيديو على السيرفر.',
        });
        toast.error('لم يتم إنشاء فصل لهذا الفيديو على السيرفر.');
        return;
      }

      try {
        let videoId = upload.videoId;

        if (!videoId) {
          this.activeUploadIndex.set(index);
          this.patchUpload(index, { status: 'uploading', progress: 0, error: null });
          videoId = await this.videosService.uploadVideo(upload.file, {
            title: this.chapterTitle(index),
          });
          this.activeUploadIndex.set(null);
          this.patchUpload(index, { videoId, progress: 100, status: 'ready' });
        }

        await this.attachVideo(sectionId, videoId, index);
      } catch (error) {
        this.activeUploadIndex.set(null);
        this.publishing.set(false);
        this.patchUpload(index, { status: 'error', error: this.describeUploadError(error) });
        toast.error(this.describeUploadError(error));
        return;
      }
    }

    this.activeUploadIndex.set(null);
    this.videosService.reset();
    this.publishing.set(false);
    this.isSuccessOpen.set(true);
  }

  private async attachVideo(sectionId: number, videoId: string, index: number): Promise<void> {
    await firstValueFrom(this.lessonService.attachVideoToSection(sectionId, videoId));
    this.patchUpload(index, { status: 'done', attached: true, error: null, progress: 100 });
  }

  protected pauseUpload(): void {
    void this.videosService.pause();
  }

  protected resumeUpload(): void {
    this.videosService.resume();
  }

  protected cancelUpload(): void {
    void this.videosService.cancel();
  }

  private patchUpload(index: number, patch: Partial<ChapterVideoUpload>): void {
    const row = this.chapterRows()[index];
    if (!row) return;

    this.patchChapter(index, { upload: { ...row.upload, ...patch } });
  }

  private patchChapter(index: number, patch: Partial<ChapterRow>): void {
    // `untracked` keeps the progress effect from depending on the signal it writes.
    untracked(() =>
      this.chapterRows.update((rows) =>
        rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
      ),
    );
  }

  private toChapterStatus(status: VideoUploadStatus): ChapterVideoStatus {
    switch (status) {
      case 'paused':
        return 'paused';
      case 'error':
      case 'cancelled':
        return 'error';
      default:
        return 'uploading';
    }
  }

  private chapterTitle(index: number): string {
    return this.chapterRows()[index]?.name.trim() || `الفصل ${index + 1}`;
  }

  private describeUploadError(error: unknown): string {
    const message = error instanceof Error ? error.message : '';

    if (!message || message === 'Upload cancelled.') return 'تم إلغاء رفع الفيديو.';
    if (message.includes('not supported'))
      return 'المتصفح لا يدعم رفع الفيديوهات القابل للاستكمال.';

    return `تعذّر رفع الفيديو: ${message}`;
  }

  private buildFormData(): FormData {
    const value = this.detailsForm.getRawValue();
    const { info, assignment } = value;
    const formData = new FormData();

    formData.append('title', (info.title ?? '').trim());
    formData.append('description', info.description ?? '');
    formData.append('price', String(info.price ?? ''));
    formData.append('currency', info.currency ?? '');
    if (info.prerequisiteLessonId != null) {
      formData.append('prerequisiteLessonId', String(info.prerequisiteLessonId));
    }
    formData.append('validityDurationInSeconds', String(info.validityDurationInSeconds));
    formData.append('isPublished', 'true');

    if (this.thumbnailFile) {
      formData.append('imageFile', this.thumbnailFile, this.thumbnailFile.name);
    }

    this.chapterRows().forEach((chapter, index) => {
      formData.append(`chapters[${index}].name`, chapter.name.trim());
      formData.append(
        `chapters[${index}].videoDurationSeconds`,
        String(chapter.upload.durationSeconds ?? 0),
      );
    });

    (value.outcomes as (string | null)[])
      .map((outcome) => (outcome ?? '').trim())
      .filter((outcome) => outcome.length > 0)
      .forEach((outcome, index) => formData.append(`outcomes[${index}]`, outcome));

    (value.academicYearIds as number[]).forEach((yearId, index) => {
      formData.append(`academicYearIds[${index}]`, String(yearId));
    });

    formData.append('assignmentEnabled', String(assignment.assignmentEnabled));
    if (assignment.assignmentDueDate) {
      formData.append('assignmentDueDate', assignment.assignmentDueDate);
    }
    if (this.assignmentFile) {
      formData.append('assignmentFile', this.assignmentFile, this.assignmentFile.name);
    }

    return formData;
  }
}
