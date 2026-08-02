import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonInfoSectionComponent } from './component/lesson-info-section-component/lesson-info-section-component';
import { AssignmentSectionComponent } from './component/assignment-section-component/assignment-section-component';
import { ChaptersSectionComponent } from './component/chapters-section-component/chapters-section-component';
import { VideoMode } from './component/lesson-editor.types';
import { PublishSuccessModalComponent } from './component/publish-success-modal-component/publish-success-modal-component';
import { LessonService } from '../../../core/Services/lesson.service';
import { toast } from 'ngx-sonner';
import { OutcomesEdit } from './component/outcomes-edit/outcomes-edit';
import { ImageUpload } from './component/image-upload/image-upload';
import { AcademicYears } from './component/academic-years/academic-years';
import { AuthService } from '../../../core/Services/auth';
import { AppRole } from '../../../core/enums/role-enum';
import { DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowRight, bootstrapCheck2, bootstrapSave } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-lesson-editor-page',
  imports: [
    ReactiveFormsModule,
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
  private readonly lessonService = inject(LessonService);
  private readonly router = inject(Router);
  private readonly numberPipe = inject(DecimalPipe);
  public readonly auth = inject(AuthService);

  readonly form: FormGroup;
  readonly id = this.route.snapshot.params['lessonId'];

  // Reactive State Signals
  readonly isPublishSuccessOpen = signal(false);
  readonly draftSaved = signal(false);
  readonly thumbnailPreview = signal<string | null>(null);
  readonly assignmentFilePreview = signal<string | null>(null);
  readonly loading = signal(false);
  readonly disableDraft = signal(false);

  readonly prerequisitesOptions = signal<{ id: number; name: string }[]>([]);
  readonly allAcademicYears = signal<{ id: number; name: string }[]>([]);

  private assignmentFile: File | null = null;
  private thumbnailFile: File | null = null;

  // Modern viewChild query Signal
  readonly chaptersSection = viewChild.required(ChaptersSectionComponent);

  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as
    AppRole | undefined;

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [null, Validators.required],
      thumbnailFileName: [null as string | null],
      prerequisiteLessonId: null,
      outcomes: this.fb.array([]),
      videoMode: ['single' as VideoMode],
      lessonVideoFileName: [null as string | null],
      academicYearIds: this.fb.array([]),
      chapters: this.fb.array([this.createChapterGroup()]),
      assignmentEnabled: [false],
      assignmentDueDate: null,
      assignmentFileName: [null as string | null],
    });
  }

  get academicYearIds(): FormArray {
    return this.form.get('academicYearIds') as FormArray;
  }

  get chapters(): FormArray {
    return this.form.get('chapters') as FormArray;
  }

  get outcomes(): FormArray {
    return this.form.get('outcomes') as FormArray;
  }

  ngOnInit(): void {
    this.lessonService.getLessonEditDetails(this.id).subscribe({
      next: (res) => {
        this.form.patchValue(res);
        this.allAcademicYears.set(res.allAcademicYearsOptions);
        this.prerequisitesOptions.set(res.prerequisitesOptions);

        this.chapters.clear();
        for (const chapter of res.chapters) {
          this.chapters.push(this.createChapterGroup(chapter.name, chapter.videoFileName));
        }

        this.form.get('assignmentDueDate')?.setValue(res.assignmentDueDate?.slice(0, 10) ?? null);

        this.form.get('assignmentFileName')?.setValue(res.assignmentFileName);
        this.assignmentFilePreview.set(res.assignmentFileName);
        this.form.get('thumbnailFileName')?.setValue(res.imageUrl);
        this.thumbnailPreview.set(res.imageUrl);

        this.outcomes.clear();
        for (const outcome of res.outcomes ?? []) {
          this.outcomes.push(this.fb.control(outcome));
        }

        this.academicYearIds.clear();
        for (const year of res.selectedAcademicYears) {
          this.academicYearIds.push(this.fb.control(year));
        }
      },
      error: () => {},
    });
  }

  private createChapterGroup(name = '', videoFileName = null): FormGroup {
    return this.fb.group({
      name: [name],
      videoFileName: [videoFileName],
    });
  }

  onLessonVideoSelected(fileName: string): void {
    this.form.get('lessonVideoFileName')?.setValue(fileName);
  }

  onThumbnailSelected(file: File | null): void {
    this.thumbnailFile = file;
    this.form.get('thumbnailFileName')?.setValue(file ? file.name : null);
  }

  onAssignmentFileSelected(file: File | null): void {
    this.assignmentFile = file;
    this.form.get('assignmentFileName')?.setValue(file ? file.name : null);
  }

  addChapter(): void {
    this.chapters.push(this.createChapterGroup());
  }

  removeChapter(index: number): void {
    this.chapters.removeAt(index);
  }

  onAssignmentToggle(): void {
    const control = this.form.get('assignmentEnabled');
    control?.setValue(!control.value);
  }

  navigateToMyLessons(): void {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER || this.normalizedRole === AppRole.ADMIN) {
      this.router.navigate(['/dashboard/mylessons']);
    }
  }

  saveDraft(): void {
    this.disableDraft.set(true);
    this.lessonService.updateLesson(this.id, this.buildLessonFormData(false)).subscribe({
      next: (res) => {
        if (res.newSection) this.uploadVideos(res.newSections);
        this.disableDraft.set(false);
        this.draftSaved.set(true);
        setTimeout(() => this.draftSaved.set(false), 2000);
      },
      error: () => {
        this.disableDraft.set(false);
      },
    });
  }

  publish(): void {
    this.loading.set(true);
    if (this.form.invalid) {
      toast.error('اكمل البيانات');
      this.loading.set(false);
      return;
    }
    this.lessonService.updateLesson(this.id, this.buildLessonFormData(true)).subscribe({
      next: (res) => {
        if (res.newSections) this.uploadVideos(res.newSections);
        this.isPublishSuccessOpen.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  closePublishSuccess(): void {
    this.isPublishSuccessOpen.set(false);
  }

  private uploadVideos(newSections: { sectionId: number; chapterIndex: number }[]): void {
    newSections.forEach(({ sectionId, chapterIndex }) => {
      const file = this.chaptersSection().videoFiles.get(chapterIndex);
      if (!file) return;

      this.lessonService.getVideoUploadUrl(sectionId).subscribe({
        next: ({ uploadUrl }) => {
          toast.promise(
            fetch(uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type },
              body: file,
            }),
            {
              loading: `جاري رفع فيديو الفصل ${this.numberPipe.transform(chapterIndex + 1)}...`,
              success: `تم رفع فيديو الفصل ${this.numberPipe.transform(chapterIndex + 1)}`,
              error: `فشل رفع فيديو الفصل ${this.numberPipe.transform(chapterIndex + 1)}`,
            },
          );
        },
      });
    });
  }

  private buildLessonFormData(isPublished: boolean): FormData {
    const fd = new FormData();

    fd.append('title', this.form.get('title')?.value ?? '');
    fd.append('description', this.form.get('description')?.value ?? '');
    fd.append('price', String(this.form.get('price')?.value ?? ''));

    const validityDays = this.form.get('validityDays')?.value;
    if (validityDays !== null && validityDays !== undefined) {
      fd.append('validityDays', String(validityDays));
    }

    const prerequisiteLessonId = this.form.get('prerequisiteLessonId')?.value;
    if (prerequisiteLessonId !== null && prerequisiteLessonId !== undefined) {
      fd.append('prerequisiteLessonId', String(prerequisiteLessonId));
    }

    fd.append('isPublished', String(isPublished));

    if (this.thumbnailFile) {
      fd.append('imageFile', this.thumbnailFile, this.thumbnailFile.name);
    }

    const chapters = (this.form.get('chapters')?.value ?? []) as {
      name: string;
      videoFileName: string | null;
    }[];
    chapters.forEach((chapter, i) => {
      fd.append(`chapters[${i}].name`, chapter.name ?? '');
      if (chapter.videoFileName) {
        fd.append(`chapters[${i}].videoFileName`, chapter.videoFileName);
      }
    });

    const outcomes = (this.form.get('outcomes')?.value ?? []) as string[];
    outcomes.forEach((outcome, i) => {
      fd.append(`outcomes[${i}]`, outcome);
    });

    const academicYearIds = (this.form.get('academicYearIds')?.value ?? []) as number[];
    academicYearIds.forEach((yearId, i) => {
      fd.append(`academicYearIds[${i}]`, String(yearId));
    });

    fd.append('assignmentEnabled', String(this.form.get('assignmentEnabled')?.value));

    const assignmentDueDate = this.form.get('assignmentDueDate')?.value;
    if (assignmentDueDate) {
      fd.append('assignmentDueDate', assignmentDueDate);
    }

    if (this.assignmentFile) {
      fd.append('assignmentFile', this.assignmentFile, this.assignmentFile.name);
    }

    return fd;
  }
}
