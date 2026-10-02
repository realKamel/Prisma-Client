import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { bootstrapArrowRight, bootstrapCheck2, bootstrapSave } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import { Observable, map } from 'rxjs';
import { AuthService } from '../../../core/Services/auth';
import { LessonService } from '../../../core/Services/lesson.service';
import { AppRole } from '../../../core/enums/role-enum';
import { AcademicYears } from './component/academic-years/academic-years';
import { AssignmentSectionComponent } from './component/assignment-section-component/assignment-section-component';
import { ChaptersSectionComponent } from './component/chapters-section-component/chapters-section-component';
import { ImageUpload } from './component/image-upload/image-upload';
import { LessonInfoSectionComponent } from './component/lesson-info-section-component/lesson-info-section-component';
import { OutcomesEdit } from './component/outcomes-edit/outcomes-edit';
import { PublishSuccessModalComponent } from './component/publish-success-modal-component/publish-success-modal-component';
import { requiredText } from './component/Utils/form-errors';

/** A chapter whose video still has to be uploaded after the lesson was saved. */
interface PendingVideoUpload {
  sectionId: number;
  chapterIndex: number;
}

@Component({
  selector: 'app-lesson-editor-page',
  imports: [
    ReactiveFormsModule,
    NgmMotionDirective,
    LessonInfoSectionComponent,
    ChaptersSectionComponent,
    AssignmentSectionComponent,
    PublishSuccessModalComponent,
    OutcomesEdit,
    ImageUpload,
    AcademicYears,
    NgIcon,
  ],
  templateUrl: './lesson-editor-page-component.html',
  providers: [DecimalPipe],
  viewProviders: [
    provideIcons({
      bootstrapArrowRight,
      bootstrapCheck2,
      bootstrapSave,
    }),
  ],
})
export class LessonEditorPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lessonService = inject(LessonService);
  private readonly numberPipe = inject(DecimalPipe);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  public readonly auth = inject(AuthService);

  /** A `:lessonId` route param means edit mode; without it we are creating a lesson. */
  private readonly lessonId = this.route.snapshot.params['lessonId'];
  protected readonly isEdit = !!this.lessonId;

  // Reactive State Signals
  protected readonly loading = signal(false);
  protected readonly disableDraft = signal(false);
  protected readonly draftSaved = signal(false);
  protected readonly isPublishSuccessOpen = signal(false);
  /** Edit mode only: true until the lesson has loaded, so an empty form can never be saved over it. */
  protected readonly formLocked = signal(this.isEdit);

  protected readonly thumbnailPreview = signal<string | null>(null);
  protected readonly assignmentFilePreview = signal<string | null>(null);
  protected readonly prerequisitesOptions = signal<{ id: number; name: string }[]>([]);
  protected readonly allAcademicYears = signal<{ id: number; name: string }[]>([]);

  private assignmentFile: File | null = null;
  private thumbnailFile: File | null = null;

  private readonly chaptersSection = viewChild.required(ChaptersSectionComponent);

  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as
    AppRole | undefined;

  protected readonly form: FormGroup = this.fb.group({
    title: ['', [requiredText, Validators.minLength(5)]],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    prerequisiteLessonId: [null as number | null],
    thumbnailFileName: [null as string | null],
    outcomes: this.fb.array([this.createOutcomeControl()], Validators.required),
    chapters: this.fb.array([this.createChapterGroup()], Validators.required),
    academicYearIds: this.fb.array([], Validators.required),
    assignmentEnabled: [false],
    assignmentDueDate: [null as string | null],
    assignmentFileName: [null as string | null],
  });

  constructor() {
    // The due date and the file are only required while the assignment is switched on.
    this.form
      .get('assignmentEnabled')!
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe((enabled) => this.applyAssignmentValidators(!!enabled));
  }

  protected get chapters(): FormArray {
    return this.form.get('chapters') as FormArray;
  }

  protected get outcomes(): FormArray {
    return this.form.get('outcomes') as FormArray;
  }

  protected get academicYearIds(): FormArray {
    return this.form.get('academicYearIds') as FormArray;
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this.loadLesson();
    } else {
      this.loadFormOptions();
    }
  }

  // ─────────────────────────── loading ───────────────────────────

  private loadFormOptions(): void {
    this.lessonService.getLessonFormOptions().subscribe({
      next: (res) => {
        this.allAcademicYears.set(res.allAcademicYearsOptions);
        this.prerequisitesOptions.set(res.prerequisitesOptions);
      },
    });
  }

  private loadLesson(): void {
    this.lessonService.getLessonEditDetails(this.lessonId).subscribe({
      next: (res) => {
        this.allAcademicYears.set(res.allAcademicYearsOptions);
        this.prerequisitesOptions.set(res.prerequisitesOptions);

        this.form.patchValue(res);

        this.chapters.clear();
        for (const chapter of res.chapters ?? []) {
          this.chapters.push(this.createChapterGroup(chapter.name, chapter.videoFileName ?? null));
        }
        if (this.chapters.length === 0) this.chapters.push(this.createChapterGroup());

        this.outcomes.clear();
        for (const outcome of res.outcomes ?? []) {
          this.outcomes.push(this.createOutcomeControl(outcome));
        }
        if (this.outcomes.length === 0) this.outcomes.push(this.createOutcomeControl());

        this.academicYearIds.clear();
        for (const year of res.selectedAcademicYears ?? []) {
          this.academicYearIds.push(this.fb.control(year));
        }

        this.form.patchValue({
          assignmentDueDate: res.assignmentDueDate?.slice(0, 10) ?? null,
          assignmentFileName: res.assignmentFileName,
          thumbnailFileName: res.imageUrl,
        });
        this.assignmentFilePreview.set(res.assignmentFileName);
        this.thumbnailPreview.set(res.imageUrl);

        this.formLocked.set(false);
      },
      error: () => {
        // Stay locked: publishing an empty form over an existing lesson would be worse than a dead page.
        toast.error('تعذّر تحميل بيانات الدرس');
      },
    });
  }

  // ─────────────────────────── form helpers ───────────────────────────

  private createChapterGroup(name = '', videoFileName: string | null = null): FormGroup {
    return this.fb.group({
      name: [name, requiredText],
      videoFileName: [videoFileName],
      videoDurationSeconds: 0
    });
  }

  private createOutcomeControl(value = ''): FormControl<string | null> {
    return this.fb.control(value, requiredText);
  }

  private applyAssignmentValidators(enabled: boolean): void {
    for (const name of ['assignmentDueDate', 'assignmentFileName']) {
      const control = this.form.get(name)!;
      if (enabled) {
        control.setValidators(Validators.required);
      } else {
        control.clearValidators();
      }
      control.updateValueAndValidity();
    }
  }

  protected addChapter(): void {
    this.chapters.push(this.createChapterGroup());
  }

  protected removeChapter(index: number): void {
    this.chapters.removeAt(index);
  }

  protected addOutcome(): void {
    this.outcomes.push(this.createOutcomeControl());
  }

  protected removeOutcome(index: number): void {
    this.outcomes.removeAt(index);
  }

  protected onThumbnailSelected(file: File | null): void {
    this.thumbnailFile = file;
    this.form.get('thumbnailFileName')?.setValue(file ? file.name : null);
  }

  protected onAssignmentToggle(): void {
    const control = this.form.get('assignmentEnabled')!;
    control.setValue(!control.value);
  }

  protected onAssignmentFileSelected(file: File | null): void {
    this.assignmentFile = file;
    const control = this.form.get('assignmentFileName')!;
    control.setValue(file ? file.name : null);
    control.markAsTouched(); // the file input isn't bound to the control, so nothing else touches it
  }

  // ─────────────────────────── actions ───────────────────────────

  protected publish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.error('يرجى ملء جميع الحقول المطلوبة بشكل صحيح قبل النشر.');
      this.scrollToFirstError();
      return;
    }

    this.loading.set(true);
    this.save(true).subscribe({
      next: (uploads) => {
        this.loading.set(false);
        this.uploadVideos(uploads);
        this.isPublishSuccessOpen.set(true);
      },
      error: () => this.loading.set(false),
    });
  }

  protected saveDraft(): void {
    // A draft only needs the fields the backend can't store without.
    const essentials = ['title', 'price'].map((name) => this.form.get(name)!);
    if (essentials.some((control) => control.invalid)) {
      essentials.forEach((control) => control.markAsTouched());
      toast.error('اكتب عنوان الدرس والسعر على الأقل قبل حفظ المسودة.');
      this.scrollToFirstError();
      return;
    }

    this.disableDraft.set(true);
    this.save(false).subscribe({
      next: (uploads) => {
        this.disableDraft.set(false);
        this.uploadVideos(uploads);
        this.draftSaved.set(true);
        setTimeout(() => this.draftSaved.set(false), 2000);
        if (!this.isEdit) this.navigateToMyLessons();
      },
      error: () => this.disableDraft.set(false),
    });
  }

  protected closePublishSuccess(): void {
    this.isPublishSuccessOpen.set(false);
    this.navigateToMyLessons();
  }

  protected navigateToMyLessons(): void {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      void this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER || this.normalizedRole === AppRole.ADMIN) {
      void this.router.navigate(['/dashboard/mylessons']);
    }
  }

  // ─────────────────────────── saving ───────────────────────────

  /** Calls the create or update endpoint and normalises what each returns into "videos to upload". */
  private save(isPublished: boolean): Observable<PendingVideoUpload[]> {
    const body = this.buildLessonFormData(isPublished);

    if (this.isEdit) {
      return this.lessonService
        .updateLesson(this.lessonId, body)
        .pipe(map((res) => res.newSections ?? []));
    }

    return this.lessonService
      .addLesson(body)
      .pipe(
        map((res) => res.sectionIds.map((sectionId, chapterIndex) => ({ sectionId, chapterIndex }))),
      );
  }

  private buildLessonFormData(isPublished: boolean): FormData {
    const value = this.form.getRawValue();
    const fd = new FormData();

    fd.append('title', (value.title ?? '').trim());
    fd.append('description', value.description ?? '');
    fd.append('price', String(value.price ?? ''));

    if (value.prerequisiteLessonId !== null && value.prerequisiteLessonId !== undefined) {
      fd.append('prerequisiteLessonId', String(value.prerequisiteLessonId));
    }

    fd.append('isPublished', String(isPublished));

    if (this.thumbnailFile) {
      fd.append('imageFile', this.thumbnailFile, this.thumbnailFile.name);
    }

    (value.chapters as { name: string | null; videoFileName: string | null; videoDurationSeconds: number|null }[]).forEach(
      (chapter, i) => {
        fd.append(`chapters[${i}].name`, (chapter.name ?? '').trim());
        if (chapter.videoFileName) {
          fd.append(`chapters[${i}].videoFileName`, chapter.videoFileName);
        }
        if(chapter.videoDurationSeconds!=null){
          fd.append(`chapters[${i}].videoDurationSeconds`, String(chapter.videoDurationSeconds))
        }
      },
    );

    // Drafts may contain blank rows; don't persist them.
    (value.outcomes as (string | null)[])
      .map((outcome) => (outcome ?? '').trim())
      .filter((outcome) => outcome.length > 0)
      .forEach((outcome, i) => fd.append(`outcomes[${i}]`, outcome));

    (value.academicYearIds as number[]).forEach((yearId, i) => {
      fd.append(`academicYearIds[${i}]`, String(yearId));
    });

    fd.append('assignmentEnabled', String(value.assignmentEnabled));

    if (value.assignmentDueDate) {
      fd.append('assignmentDueDate', value.assignmentDueDate);
    }

    if (this.assignmentFile) {
      fd.append('assignmentFile', this.assignmentFile, this.assignmentFile.name);
    }

    return fd;
  }

  private uploadVideos(uploads: PendingVideoUpload[]): void {
    const videoFiles = this.chaptersSection().videoFiles;

    for (const { sectionId, chapterIndex } of uploads) {
      const fileName = this.chapters.at(chapterIndex)?.get('videoFileName')?.value as
        | string
        | null
        | undefined;
      const file = fileName ? videoFiles.get(fileName) : undefined;
      if (!file) continue;

      const label = this.numberPipe.transform(chapterIndex + 1);

      this.lessonService.getVideoUploadUrl(sectionId, file.name).subscribe({
        next: ({ uploadUrl }) => {
          // fetch() only rejects on network errors, so a 403/404 from the storage would look like success.
          const upload = fetch(uploadUrl, {
            method: 'PUT',
            // headers: { 'Content-Type': file.type },
            body: file,
          }).then((response) => {
            if (!response.ok) throw new Error(`Upload failed (${response.status})`);
            return response;
          });

          toast.promise(upload, {
            loading: `جاري رفع فيديو الفصل ${label}...`,
            success: `تم رفع فيديو الفصل ${label}`,
            error: `فشل رفع فيديو الفصل ${label}`,
          });
        },
      });
    }
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      this.host.nativeElement
        .querySelector('[data-field-error]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}