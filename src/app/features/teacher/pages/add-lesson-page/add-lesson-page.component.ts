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
  SectionVideoUploadLink,
} from '../../../../domain/lessons/models/lesson.model';
import { LessonService } from '../../../../domain/lessons/services/lesson.service';
import { FileUploadService } from '../../../../domain/services/file-upload/file-upload.service';
import { VideosTusUploadService } from '../../../../domain/services/videos-service/video-tus-upload.service';
import {
  TusVideoUploadCredentials,
  VideoUploadStatus,
} from '../../../../domain/services/videos-service/videos.models';
import { DeleteModalService } from '../../../../shared/components/delete-modal/delete-modal.service';
import { SubmitButtonComponent } from '../../../../shared/components/submit-button/submit-button.component';
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
import { readVideoDuration } from './utils/video-duration';

/**
 * Two-step lesson creation: lesson details first, chapter videos second.
 * The lesson is saved (v2) before any section exists; creating a chapter's section also creates
 * its video and the signed upload link the TUS upload needs.
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
  private readonly videosService = inject(VideosTusUploadService);
  private readonly successModal = inject(SuccessModalService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly deleteModal = inject(DeleteModalService);
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
  /** Row whose section is being deleted on the server right now. */
  protected readonly deletingSectionIndex = signal<number | null>(null);
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
      this.creatingSectionIndex() !== null ||
      this.deletingSectionIndex() !== null,
  );

  protected readonly busyMessage = computed(() => {
    if (this.publishing()) {
      return 'جاري إنشاء الدرس ورفع الفيديوهات... لا تغلق الصفحة.';
    }

    const uploading = this.uploadingRowIndex();
    if (uploading !== null) {
      return `جاري رفع فيديو الفصل ${uploading + 1}... لا تغلق الصفحة.`;
    }

    const creating = this.creatingSectionIndex();
    if (creating !== null) return `جاري إنشاء الفصل${creating + 1} وتجهيز رابط رفع الفيديو...`;

    const deleting = this.deletingSectionIndex();
    if (deleting !== null) return `جاري حذف الفصل${deleting + 1}...`;

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
    if (this.busy()) return;
    this.chapterRows.update((rows) => [...rows, createChapterRow()]);
  }

  /**
   * Removes one chapter. When its section already exists on the server, that section (and its
   * video) is deleted first so the two stay in sync; the row is only dropped once the API agrees.
   */
  protected onRemoveChapter(index: number): void {
    const row = this.chapterRows()[index];
    if (!row || this.busy() || this.chapterRows().length <= 1) return;

    const lesson = this.lessonLinks();
    if (!row.sectionId || !lesson) {
      this.dropChapter(index);
      return;
    }

    this.deleteModal
      .confirmDelete(
        row.name.trim() || `الفصل ${index + 1}`,
        'سيتم حذف الفصل وفيديو هذا الفصل نهائيًا. لا يمكن التراجع عن هذا الإجراء.',
      )
      .closed.subscribe((confirmed) => {
        if (!confirmed) return;
        void this.deleteSection(index, lesson.lessonId, row.sectionId!);
      });
  }

  private async deleteSection(index: number, lessonId: string, sectionId: string): Promise<void> {
    this.deletingSectionIndex.set(index);

    try {
      await firstValueFrom(this.lessonService.removeLessonSection(lessonId, sectionId));
      this.dropChapter(index);
      toast.success(`تم حذف الفصل${index + 1}.`);
    } catch (error) {
      toast.error(`تعذّر حذف الفصل${index + 1}: ${this.describeError(error)}`);
    } finally {
      this.deletingSectionIndex.set(null);
    }
  }

  private dropChapter(index: number): void {
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
      error: null,
    });
  }

  protected onChapterFileCleared(index: number): void {
    const row = this.chapterRows()[index];
    if (!row || row.upload.status === 'done') return;
    // Keep the signed link of the section's video so the new file uploads to the same video.
    this.patchUpload(index, {
      ...createChapterVideoUpload(),
      credentials: row.upload.credentials,
    });
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

    // The lesson itself is only created once a section is needed, so this step is purely local.
    this.stepper().next();
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
   * create lesson (v2 JSON) -> upload cover -> upload assignment file -> create each chapter's
   * section (which also creates its video and upload link) -> upload each chapter video through TUS.
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

    // The backend assigns `sectionSortOrder` in creation order, so chapters must be created in order.
    if (
      this.chapterRows()
        .slice(0, index)
        .some((previous) => previous.sectionId === null)
    ) {
      toast.error('أنشئ أقسام الفصول السابقة أولًا للحفاظ على ترتيب الفصول.');
      return;
    }

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
      toast.success(`تم إنشاء الفصل${index + 1}، يمكنك الآن رفع الفيديو.`);
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
      const task = this.fileUploadService.upload(links.coverUploadUrl, file);
      if (task.status() == 'completed') {
        this.coverUploaded.set(true);
      }
    } catch (error) {
      throw new Error(`تعذّر رفع صورة الغلاف: ${this.describeError(error)}`, { cause: error });
    }
  }

  private async uploadAssignmentFile(links: AddLessonResponse): Promise<void> {
    const file = this.assignmentFile;
    // The API only returns a link when the assignment was enabled for this lesson.
    if (!file || !links.assignmentUploadUrl || this.assignmentUploaded()) return;

    try {
      const task = this.fileUploadService.upload(links.assignmentUploadUrl, file);
      if (task.status() == 'completed') {
        this.assignmentUploaded.set(true);
      }
    } catch (error) {
      throw new Error(`تعذّر رفع ملف الواجب: ${this.describeError(error)}`, { cause: error });
    }
  }

  /**
   * Creates the section of one chapter together with its video and upload link. The returned
   * credentials are the only way to upload the file, so they are kept on the row.
   */
  private async ensureSection(index: number): Promise<string> {
    const row = this.chapterRows()[index];
    if (!row) throw new Error(`الفصل ${index + 1} غير موجود.`);
    if (row.sectionId !== null) return row.sectionId;

    const lesson = await this.ensureLesson();

    try {
      const created = await firstValueFrom(
        this.lessonService.createLessonSection(lesson.lessonId, {
          title: this.chapterTitle(index),
          // The API stores a whole number of seconds, while the browser reports a float.
          videoDurationInSeconds: Math.round(row.upload.durationSeconds),
          isPreviewable: false,
        }),
      );

      this.patchChapter(index, { sectionId: created.sectionId, videoId: created.videoId });
      this.patchUpload(index, { credentials: this.toUploadCredentials(created) });

      return created.sectionId;
    } catch (error) {
      throw new Error(`تعذّر إنشاء الفصل${index + 1}: ${this.describeError(error)}`, {
        cause: error,
      });
    }
  }

  /**
   * Credentials for the row's video, renewing the signed link when it expired — which is what
   * makes retrying an upload (or resuming it later) possible.
   */
  private async resolveUploadCredentials(index: number): Promise<TusVideoUploadCredentials> {
    const row = this.chapterRows()[index];
    if (!row?.sectionId || !row.videoId) {
      throw new Error(`لم يتم إنشاء الفصل${index + 1} بعد، تعذّر رفع الفيديو.`);
    }

    const current = row.upload.credentials;
    // Retrying after a failed attempt renews too: an expired signature surfaces as that failure.
    const canReuse =
      current !== null &&
      current.videoId === row.videoId &&
      row.upload.status !== 'error' &&
      !this.isUploadLinkExpired(current.expirationTime);

    if (canReuse) return current;

    const lesson = this.lessonLinks();
    if (!lesson) throw new Error('لم يتم حفظ الدرس بعد، تعذّر تجديد رابط الرفع.');

    try {
      const renewed = await firstValueFrom(
        this.lessonService.renewSectionVideoUploadLink(lesson.lessonId, row.sectionId, row.videoId),
      );

      const credentials = this.toUploadCredentials(renewed);
      this.patchUpload(index, { credentials });

      return credentials;
    } catch (error) {
      throw new Error(
        `تعذّر تجديد رابط رفع فيديو الفصل ${index + 1}: ${this.describeError(error)}`,
        { cause: error },
      );
    }
  }

  private toUploadCredentials(link: SectionVideoUploadLink): TusVideoUploadCredentials {
    return {
      videoId: link.videoId,
      libraryId: link.libraryId,
      expirationTime: link.expirationTime,
      signature: link.signature,
    };
  }

  /** Bunny signatures expire, so anything close to expiry is renewed before it can fail an upload. */
  private isUploadLinkExpired(expirationTimeSeconds: number): boolean {
    return expirationTimeSeconds * 1000 - Date.now() < 60_000;
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

  /** Uploads one chapter video through TUS; the video is already attached to its section. */
  private async uploadRow(index: number): Promise<void> {
    const row = this.chapterRows()[index];
    if (!row?.upload.file || row.upload.status === 'done') return;

    await this.ensureSection(index);
    const credentials = await this.resolveUploadCredentials(index);
    const file = this.chapterRows()[index]?.upload.file;
    if (!file) return;

    this.activeUploadIndex.set(index);
    this.patchUpload(index, { status: 'uploading', progress: 0, error: null });

    try {
      await this.videosService.uploadVideo(file, credentials, {
        title: this.chapterTitle(index),
      });
    } catch (error) {
      this.activeUploadIndex.set(null);
      this.patchUpload(index, { status: 'error', error: this.describeUploadError(error) });
      throw error;
    }

    this.activeUploadIndex.set(null);
    this.patchUpload(index, {
      status: 'done',
      progress: 100,
      bytesUploaded: file.size,
      error: null,
    });
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
