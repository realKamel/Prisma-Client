import { CdkStepperModule } from '@angular/cdk/stepper';
import { HttpErrorResponse } from '@angular/common/http';
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
import {
  AddLessonRequest,
  AddLessonResponse,
  AddLessonSectionRequest,
} from '../../../core/Models/lesson.model';
import { AuthService } from '../../../core/Services/auth';
import { LessonService } from '../../../core/Services/lesson.service';
import { TeachersService } from '../../../core/Services/teachers.service';
import { VideoUploadStatus } from '../../common/services/videos-service/videos.models';
import { VideosService } from '../../common/services/videos-service/videos.service';
import { AcademicYearsComponent } from '../lesson-editor-page-component/component/academic-years/academic-years';
import { AssignmentSectionComponent } from '../lesson-editor-page-component/component/assignment-section-component/assignment-section-component';
import { ImageUploadComponent } from '../lesson-editor-page-component/component/image-upload/image-upload';
import { LessonInfoSectionComponent } from '../lesson-editor-page-component/component/lesson-info-section-component/lesson-info-section-component';
import { OutcomesEdit } from '../lesson-editor-page-component/component/outcomes-edit/outcomes-edit';
import { requiredText } from '../lesson-editor-page-component/component/Utils/form-errors';
import { ChapterVideosStepComponent } from './components/chapter-videos-step/chapter-videos-step';
import { LessonStepperComponent } from './components/lesson-stepper/lesson-stepper';
import { SuccessModalService } from './components/success-modal/success-modal.service';
import { ChapterRow, createChapterRow } from './models/chapter-row.model';
import {
  ChapterVideoStatus,
  ChapterVideoUpload,
  createChapterVideoUpload,
} from './models/chapter-video-upload.model';
import { uploadToPresignedUrl } from './utils/presigned-upload';
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
    ImageUploadComponent,
    AcademicYearsComponent,
    OutcomesEdit,
    AssignmentSectionComponent,
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
  private readonly successModal = inject(SuccessModalService);
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
      assignmentGrade: [null as number | null, Validators.min(1)],
      assignmentFileName: [null as string | null],
    }),
  });

  protected readonly publishing = signal(false);
  protected readonly prerequisitesOptions = signal<{ id: number; name: string }[]>([]);
  protected readonly allAcademicYears = signal<{ id: number; name: string }[]>([]);
  protected readonly chapterRows = signal<ChapterRow[]>([createChapterRow()]);
  /** Turns on the per-row title errors after a publish attempt with empty titles. */
  protected readonly showChapterErrors = signal(false);
  /** Index of the chapter whose TUS upload feeds the progress signals right now. */
  protected readonly activeUploadIndex = signal<number | null>(null);

  /** Set once the lesson exists on the server, so a retry never creates it twice. */
  private readonly lessonLinks = signal<AddLessonResponse | null>(null);
  private readonly coverUploaded = signal(false);
  private readonly assignmentUploaded = signal(false);
  private sectionIds: number[] = [];

  protected readonly structureLocked = computed(() => this.lessonLinks() !== null);

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

    // The grade is optional while the assignment is off, but must be a positive number once it is on.
    const grade = this.assignmentGroup.get('assignmentGrade')!;
    grade.setValidators(enabled ? [Validators.required, Validators.min(1)] : [Validators.min(1)]);
    grade.updateValueAndValidity();
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
    this.stepper().selectedIndex = 1;
    void this.runPublishPipeline();
  }

  /**
   * create lesson (v2 JSON) -> upload cover -> upload assignment file -> create sections
   * -> upload each chapter video through TUS -> link every video to its section.
   * Every step is idempotent, so pressing publish again only retries what is still missing.
   */
  private async runPublishPipeline(): Promise<void> {
    this.publishing.set(true);

    try {
      const links = await this.ensureLesson();
      await this.uploadCover(links);
      await this.uploadAssignmentFile(links);
      const sectionIds = await this.ensureSections(links.lessonId);
      await this.uploadVideos(sectionIds);
    } catch (error) {
      this.activeUploadIndex.set(null);
      this.publishing.set(false);
      toast.error(this.describeError(error));
      return;
    }

    this.activeUploadIndex.set(null);
    this.videosService.reset();
    this.publishing.set(false);
    this.successModal.openPublishSuccess().closed.subscribe(() => this.navigateToMyLessons());
  }

  private async ensureLesson(): Promise<AddLessonResponse> {
    const existing = this.lessonLinks();
    if (existing) return existing;

    try {
      const links = await firstValueFrom(
        this.lessonService.addLessonV2(this.buildAddLessonRequest()),
      );
      this.lessonLinks.set(links);
      return links;
    } catch (error) {
      throw new Error(`تعذّر حفظ الدرس: ${this.describeError(error)}`, { cause: error });
    }
  }

  private async uploadCover(links: AddLessonResponse): Promise<void> {
    const file = this.thumbnailFile;
    if (!file || this.coverUploaded()) return;

    try {
      await uploadToPresignedUrl(links.coverUploadUrl, file);
      this.coverUploaded.set(true);
    } catch (error) {
      throw new Error(`تعذّر رفع صورة الغلاف: ${this.describeError(error)}`, { cause: error });
    }
  }

  private async uploadAssignmentFile(links: AddLessonResponse): Promise<void> {
    const file = this.assignmentFile;
    // The API only returns a link when the assignment was enabled for this lesson.
    if (!file || !links.assignmentUploadUrl || this.assignmentUploaded()) return;

    try {
      await uploadToPresignedUrl(links.assignmentUploadUrl, file);
      this.assignmentUploaded.set(true);
    } catch (error) {
      throw new Error(`تعذّر رفع ملف الواجب: ${this.describeError(error)}`, { cause: error });
    }
  }

  /** Creates one section per chapter; the video step cannot link anything without their ids. */
  private async ensureSections(lessonId: string): Promise<number[]> {
    if (this.sectionIds.length > 0) return this.sectionIds;

    const sections: AddLessonSectionRequest[] = this.chapterRows().map((row) => ({
      name: row.name.trim(),
      videoDurationSeconds: row.upload.durationSeconds,
    }));

    try {
      const created = await firstValueFrom(
        this.lessonService.createLessonSections(lessonId, sections),
      );
      this.sectionIds = [...created]
        .sort((a, b) => a.chapterIndex - b.chapterIndex)
        .map((section) => section.sectionId);
    } catch (error) {
      // TODO(api): remove this hint once the sections endpoint is live.
      throw new Error(`تعذّر إنشاء فصول الدرس: ${this.describeError(error)}`, { cause: error });
    }

    if (this.sectionIds.length !== sections.length) {
      throw new Error('تعذّر إنشاء فصول الدرس: عدد الفصول المُنشأة لا يطابق المحتوى.');
    }

    return this.sectionIds;
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
  private async uploadVideos(sectionIds: number[]): Promise<void> {
    this.videosService.reset();

    for (let index = 0; index < this.chapterRows().length; index++) {
      const upload = this.chapterRows()[index].upload;

      if (!upload.file || upload.status === 'done') continue;

      const sectionId = sectionIds[index];
      if (sectionId === undefined) {
        throw new Error(`لم يعد للفصل ${index + 1} قسم على السيرفر، أعد تحميل الصفحة.`);
      }

      let videoId = upload.videoId;

      if (!videoId) {
        this.activeUploadIndex.set(index);
        this.patchUpload(index, { status: 'uploading', progress: 0, error: null });

        try {
          videoId = await this.videosService.uploadVideo(upload.file, {
            title: this.chapterTitle(index),
          });
        } catch (error) {
          this.activeUploadIndex.set(null);
          this.patchUpload(index, { status: 'error', error: this.describeUploadError(error) });
          throw error;
        }

        this.activeUploadIndex.set(null);
        this.patchUpload(index, { videoId, progress: 100, status: 'ready' });
      }

      await this.attachVideo(sectionId, videoId, index);
    }
  }

  private async attachVideo(sectionId: number, videoId: string, index: number): Promise<void> {
    try {
      await firstValueFrom(this.lessonService.attachVideoToSection(sectionId, videoId));
      this.patchUpload(index, { status: 'done', attached: true, error: null, progress: 100 });
    } catch (error) {
      const message = this.describeError(error);
      this.patchUpload(index, { status: 'error', error: message });
      throw new Error(`تعذّر ربط فيديو الفصل ${index + 1}: ${message}`, { cause: error });
    }
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

  /** Prefers the API's problem details over the raw HTTP status. */
  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const problem = error.error as {
        title?: string;
        detail?: string;
        errors?: Record<string, string[]>;
      } | null;

      return (
        problem?.detail ??
        problem?.title ??
        Object.values(problem?.errors ?? {}).flat()[0] ??
        `HTTP ${error.status}`
      );
    }

    const message = error instanceof Error ? error.message : '';
    return message || 'خطأ غير متوقع.';
  }

  private buildAddLessonRequest(): AddLessonRequest {
    const { info, assignment } = this.detailsForm.getRawValue();
    const assignmentEnabled = !!assignment.assignmentEnabled;

    return {
      title: (info.title ?? '').trim(),
      description: (info.description ?? '').trim() || null,
      price: Number(info.price ?? 0),
      currency: info.currency ?? '',
      prerequisiteLessonId: info.prerequisiteLessonId ?? null,
      assignmentEnabled,
      assignmentDueDate: assignment.assignmentDueDate
        ? new Date(assignment.assignmentDueDate).toISOString()
        : null,
      assignmentGrade: assignmentEnabled ? Number(assignment.assignmentGrade ?? 0) : null,
      // TODO(api): the options endpoint still returns numeric ids; send them as Guid strings once
      // it exposes AcademicYear.PublicId.
      academicYearIds: this.academicYearIds.value,
      outcomes: (this.outcomes.value as (string | null)[])
        .map((outcome) => (outcome ?? '').trim())
        .filter((outcome) => outcome.length > 0),
      validityDurationInSeconds: Number(info.validityDurationInSeconds ?? 0),
    };
  }
}
