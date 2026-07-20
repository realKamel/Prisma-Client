import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { VideoMode } from './component/lesson-editor.types';
import { LessonInfoSectionAddComponent } from './component/lesson-info-section-component/lesson-info-section-component';
import { ChaptersSectionAddComponent } from './component/chapters-section-component/chapters-section-component';
import { AssignmentSectionAddComponent } from './component/assignment-section-component/assignment-section-component';
import { PublishSuccessModalAddComponent } from './component/publish-success-modal-component/publish-success-modal-component';
import { OutcomesAdd } from './component/outcomes-edit/outcomes-edit';
import { ImageUploadAdd } from './component/image-upload/image-upload';
import { AcademicYearsAdd } from './component/academic-years/academic-years';
import { LessonService } from '../../../core/Services/lesson.service';
import { AuthService } from '../../../core/Services/auth';
import { AppRole } from '../../../core/enums/role-enum';
import { DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowRight, bootstrapCheck2, bootstrapSave } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-add-lesson-component',
  imports: [
    PublishSuccessModalAddComponent,
    LessonInfoSectionAddComponent,
    ChaptersSectionAddComponent,
    AssignmentSectionAddComponent,
    ReactiveFormsModule,
    OutcomesAdd,
    ImageUploadAdd,
    AcademicYearsAdd,
    NgIcon,
  ],
  templateUrl: './add-lesson-component.html',
  styleUrl: './add-lesson-component.css',
  providers: [DecimalPipe],
  viewProviders: [
    provideIcons({
      bootstrapCheck2,
      bootstrapSave,
      bootstrapArrowRight,
    }),
  ],
})
export class AddLessonComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lessonService = inject(LessonService);
  private readonly router = inject(Router);
  public readonly auth = inject(AuthService);
  private readonly numberPipe = inject(DecimalPipe);

  // Core Template Reference Query
  readonly chaptersSection = viewChild.required(ChaptersSectionAddComponent);

  // Reactive State Signals
  readonly loading = signal<boolean>(false);
  readonly isPublishSuccessOpen = signal<boolean>(false);
  readonly draftSaved = signal<boolean>(false);
  readonly disableDraft = signal<boolean>(false);

  readonly form: FormGroup;

  // Static options state metrics
  readonly allAcademicYears = signal<{ id: number; name: string }[]>([]);
  readonly prerequisitesOptions = signal<{ id: number; name: string }[]>([]);

  private assignmentFile: File | null = null;
  private thumbnailFile: File | null = null;

  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as
    AppRole | undefined;

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [null, Validators.required],
      prerequisiteLessonId: [null],
      thumbnailFileName: [null as string | null],
      outcomes: this.fb.array([]),
      videoMode: ['single' as VideoMode],
      lessonVideoFileName: [null as string | null],
      chapters: this.fb.array([this.createChapterGroup()]),
      assignmentEnabled: [false],
      assignmentDueDate: null,
      assignmentFileName: [null as string | null],
      academicYearIds: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.lessonService.getLessonFormOptions().subscribe({
      next: (res) => {
        this.allAcademicYears.set(res.data.allAcademicYearsOptions);
        this.prerequisitesOptions.set(res.data.prerequisitesOptions);
      },
    });
  }

  get chapters(): FormArray {
    return this.form.get('chapters') as FormArray;
  }

  get outcomes(): FormArray {
    return this.form.get('outcomes') as FormArray;
  }

  get academicYearIds(): FormArray {
    return this.form.get('academicYearIds') as FormArray;
  }

  private createChapterGroup(name = ''): FormGroup {
    return this.fb.group({
      name: [name],
      videoFileName: [null as string | null],
    });
  }

  onLessonVideoSelected(fileName: string): void {
    this.form.get('lessonVideoFileName')?.setValue(fileName);
  }

  onThumbnailSelected(file: File | null): void {
    this.thumbnailFile = file;
    this.form.get('thumbnailFileName')?.setValue(file ? file.name : null);
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

  onAssignmentFileSelected(file: File | null): void {
    this.assignmentFile = file;
    this.form.get('assignmentFileName')?.setValue(file ? file.name : null);
  }

  private buildLessonFormData(isPublished: boolean): FormData {
    const fd = new FormData();

    fd.append('title', this.form.get('title')?.value ?? '');
    fd.append('description', this.form.get('description')?.value ?? '');
    fd.append('price', String(this.form.get('price')?.value ?? ''));

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

  saveDraft(): void {
    this.disableDraft.set(true);
    this.lessonService.addLesson(this.buildLessonFormData(false)).subscribe({
      next: (res) => {
        this.disableDraft.set(false);
        this.draftSaved.set(true);
        setTimeout(() => this.draftSaved.set(false), 2000);
        this.uploadVideos(res.data.sectionIds);
        this.navigateToMyLessons();
      },
      error: () => {
        this.disableDraft.set(false);
      },
    });
  }

  navigateToMyLessons(): void {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER || this.normalizedRole === AppRole.ADMIN) {
      this.router.navigate(['/dashboard/mylessons']);
    }
  }

  publish(): void {
    if (this.form.invalid) {
      toast.error('اكمل البيانات');
      return;
    }
    this.loading.set(true);
    this.lessonService.addLesson(this.buildLessonFormData(true)).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.uploadVideos(res.data.sectionIds);
        this.isPublishSuccessOpen.set(true);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private uploadVideos(sectionIds: number[]): void {
    sectionIds.forEach((sectionId, i) => {
      const file = this.chaptersSection().videoFiles.get(i);
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
              loading: `جاري رفع فيديو الفصل ${this.numberPipe.transform(i + 1)}...`,
              success: `تم رفع فيديو الفصل ${this.numberPipe.transform(i + 1)}`,
              error: `فشل رفع فيديو الفصل ${this.numberPipe.transform(i + 1)}`,
            },
          );
        },
      });
    });
  }

  closePublishSuccess(): void {
    this.isPublishSuccessOpen.set(false);
    this.navigateToMyLessons();
  }
}
