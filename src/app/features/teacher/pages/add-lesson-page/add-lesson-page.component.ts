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
import { AppRole } from '../../../../core/enums/role-enum';
import { AuthService } from '../../../../core/services/auth/auth';
import {
  AddLessonRequest,
  AddLessonResponse,
} from '../../../../domain/lessons/models/lesson.model';
import { LessonService } from '../../../../domain/lessons/services/lesson.service';
import { SubmitButtonComponent } from '../../../../shared/components/submit-button/submit-button.component';
import { VideoUploadStatus } from '../../../common/services/videos-service/videos.models';
import { VideosService } from '../../../common/services/videos-service/videos.service';
import { TeachersService } from '../../services/teachers.service';
import { AcademicYearsComponent } from '../lesson-editor-page-component/component/academic-years/academic-years';
import { AssignmentSectionComponent } from '../lesson-editor-page-component/component/assignment-section-component/assignment-section-component';
import { ImageUploadComponent } from '../lesson-editor-page-component/component/image-upload/image-upload';
import { LessonInfoSectionComponent } from '../lesson-editor-page-component/component/lesson-info-section-component/lesson-info-section-component';
import { OutcomesEdit } from '../lesson-editor-page-component/component/outcomes-edit/outcomes-edit';
import { requiredText } from '../lesson-editor-page-component/component/utils/form-errors';
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
 * The lesson is saved (v2) before any section exists; each chapter can then get its section on
 * demand, which is what the video upload and its link back to the section need.
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
    SubmitButtonComponent,
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
  /** Row whose section is being created (one request at a time). */
  protected readonly creatingSectionIndex = signal<number | null>(null);
  /** Row whose video upload the teacher explicitly started. */
  protected readonly uploadingRowIndex = signal<number | null>(null);

  /** Set once the lesson exists on the server, so a retry never creates it twice. */
  private readonly lessonLinks = signal<AddLessonResponse | null>(null);
  private readonly coverUploaded = signal(false);
  private readonly assignmentUploaded = signal(false);

  protected readonly structureLocked = computed(() => this.lessonLinks() !== null);
  /** Any long-running server work: creating the lesson, a section, or uploading a video. */
  protected readonly busy = computed(
    () =>
      this.publishing() ||
      this.uploadingRowIndex() !== null ||
      this.creatingSectionIndex() !== null,
  );

  protected readonly busyMessage = computed(() => {
    if (this.publishing()) {
      return 'جاري إنشاء الدرس ورفع الفيديوهات وربطها بالفصول... لا تغلق الصفحة.';
    }

    const uploading = this.uploadingRowIndex();
    if (uploading !== null) {
      return `جاري رفع فيديو الفصل ${uploading + 1} وربطه بالقسم... لا تغلق الصفحة.`;
    }

    const creating = this.creatingSectionIndex();
    if (creating !== null) return `جاري إنشاء القسم ${creating + 1}...`;

    return '';
  });

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
    // else {
    //   this.lessonService.addLessonV2(this.detailsForm.value).subscribe({
    //     next: (result) => {
    //       this.stepper().next();
    //     },
    //   });
    // }
  }

  protected goBackToDetails(): void {
    if (this.busy()) return;
    this.stepper().previous();
  }

  protected cancel(): void {
    if (this.busy()) return;
    this.navigateToMyLessons();
  }

  private navigateToMyLessons(): void {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      void this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER || this.normalizedRole === AppRole.ADMIN) {
      void this.router.navigate(['/dashboard/mylessons']);
    }
  }

  // publishing

  protected publish(): void {
    if (this.publishing()) return;

    if (!this.ensureDetailsValid()) return;

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

  /** Marks step 1 and returns false when the lesson details can't be saved yet. */
  private ensureDetailsValid(): boolean {
    if (!this.detailsForm.invalid) return true;

    this.detailsForm.markAllAsTouched();
    this.stepper().selectedIndex = 0;
    toast.error('يرجى استكمال بيانات الدرس بشكل صحيح قبل المتابعة.');
    return false;
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
      await this.saveLessonFiles(links);

      for (let index = 0; index < this.chapterRows().length; index++) {
        await this.ensureSection(index);
        await this.uploadRow(index);
      }
    } catch (error) {
      this.activeUploadIndex.set(null);
      this.uploadingRowIndex.set(null);
      this.publishing.set(false);
      toast.error(this.describeError(error));
      return;
    }

    this.finishPublishing();
  }

  /** Creates the lesson (with its cover/assignment files) once, when the teacher needs a section. */
  protected async onCreateSection(index: number): Promise<void> {
    const row = this.chapterRows()[index];
    if (!row || row.sectionId !== null) return;
    if (this.publishing() || this.creatingSectionIndex() !== null) return;

    if (!this.ensureDetailsValid()) return;

    if (!row.name.trim()) {
      this.showChapterErrors.set(true);
      toast.error(`اكتب عنوانًا للفصل ${index + 1} أولًا.`);
      return;
    }

    this.creatingSectionIndex.set(index);

    try {
      const links = await this.ensureLesson();
      await this.saveLessonFiles(links);
      await this.ensureSection(index);
      toast.success(`تم إنشاء القسم ${index + 1}، يمكنك الآن رفع الفيديو.`);
    } catch (error) {
      toast.error(this.describeError(error));
    } finally {
      this.creatingSectionIndex.set(null);
    }
  }

  /** Starts the upload of one chapter video on demand (the TUS service runs a single upload). */
  protected async onStartRowUpload(index: number): Promise<void> {
    const row = this.chapterRows()[index];
    if (!row?.upload.file || row.upload.status === 'done') return;
    if (this.publishing() || this.uploadingRowIndex() !== null) return;

    if (this.videosService.isActive()) {
      toast.error('هناك فيديو آخر قيد الرفع، أوقفه مؤقتًا أو انتظر انتهاءه.');
      return;
    }

    if (!this.ensureDetailsValid()) return;

    this.uploadingRowIndex.set(index);

    try {
      const links = await this.ensureLesson();
      await this.saveLessonFiles(links);
      await this.ensureSection(index);
      await this.uploadRow(index);
    } catch (error) {
      toast.error(this.describeError(error));
      return;
    } finally {
      this.uploadingRowIndex.set(null);
    }

    if (this.isEveryRowUploaded()) this.finishPublishing();
  }

  protected onPauseUpload(index: number): void {
    if (this.activeUploadIndex() !== index) return;
    void this.videosService.pause();
  }

  protected onResumeUpload(index: number): void {
    if (this.activeUploadIndex() !== index) return;
    this.videosService.resume();
  }

  protected async onCancelUpload(index: number): Promise<void> {
    if (this.activeUploadIndex() !== index) return;

    await this.videosService.cancel();
    this.activeUploadIndex.set(null);
    this.patchUpload(index, { status: 'ready', progress: 0, error: null });
  }

  private finishPublishing(): void {
    this.activeUploadIndex.set(null);
    this.uploadingRowIndex.set(null);
    this.creatingSectionIndex.set(null);
    this.videosService.reset();
    this.publishing.set(false);
    this.successModal.openPublishSuccess().closed.subscribe(() => this.navigateToMyLessons());
  }

  private isEveryRowUploaded(): boolean {
    const rows = this.chapterRows();
    return rows.length > 0 && rows.every((row) => row.upload.status === 'done');
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

  /** Uploads the cover/assignment files the API returned links for; each one is uploaded only once. */
  private async saveLessonFiles(links: AddLessonResponse): Promise<void> {
    await this.uploadCover(links);
    await this.uploadAssignmentFile(links);
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

  /** Creates the section of one chapter, which is what gives the video its upload target. */
  private async ensureSection(index: number): Promise<number> {
    const row = this.chapterRows()[index];
    if (!row) throw new Error(`الفصل ${index + 1} غير موجود.`);
    if (row.sectionId !== null) return row.sectionId;

    const lesson = this.lessonLinks();
    if (!lesson) throw new Error('لم يتم حفظ الدرس بعد، تعذّر إنشاء القسم.');

    const request: AddLessonRequest = {} as AddLessonRequest;
    try {
      const created = await firstValueFrom(this.lessonService.addLessonV2(request));

      this.patchChapter(index, { sectionId: 1 });
      // return created.sectionId;
      return 1;
    } catch (error) {
      // TODO(api): remove this hint once the sections endpoint is live.
      throw new Error(`تعذّر إنشاء القسم ${index + 1}: ${this.describeError(error)}`, {
        cause: error,
      });
    }
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

  /** Uploads one chapter video through TUS and links it to its section. */
  private async uploadRow(index: number): Promise<void> {
    const row = this.chapterRows()[index];
    if (!row?.upload.file || row.upload.status === 'done') return;

    const sectionId = await this.ensureSection(index);
    let videoId = row.upload.videoId;

    if (!videoId) {
      this.activeUploadIndex.set(index);
      this.patchUpload(index, { status: 'uploading', progress: 0, error: null });

      try {
        videoId = await this.videosService.uploadVideo(row.upload.file, {
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

  private async attachVideo(sectionId: number, videoId: string, index: number): Promise<void> {
    try {
      await firstValueFrom(this.lessonService.attachVideoToSection(sectionId, videoId));
      this.patchChapter(index, {
        upload: {
          ...this.chapterRows()[index].upload,
          status: 'done',
          attached: true,
          error: null,
          progress: 100,
        },
      });
    } catch (error) {
      const message = this.describeError(error);
      this.patchUpload(index, { status: 'error', error: message });
      throw new Error(`تعذّر ربط فيديو الفصل ${index + 1}: ${message}`, { cause: error });
    }
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
      case 'idle':
      case 'preparing':
        return 'ready';
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
