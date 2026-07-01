import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LessonInfoSectionComponent } from './component/lesson-info-section-component/lesson-info-section-component';
import { AssignmentSectionComponent } from './component/assignment-section-component/assignment-section-component';
import { ChaptersSectionComponent } from './component/chapters-section-component/chapters-section-component';
import { VideoMode } from './component/lesson-editor.types';
import { PublishSuccessModalComponent } from './component/publish-success-modal-component/publish-success-modal-component';
import { LessonService } from '../../../core/Services/lesson.service';
import { toast } from 'ngx-sonner';
import { OutcomesEdit } from "./component/outcomes-edit/outcomes-edit";
import { ImageUpload } from "./component/image-upload/image-upload";
import { AcademicYears } from './component/academic-years/academic-years';
import { AuthService } from '../../../core/Services/auth';
import { AppRole } from '../../../core/enums/role-enum';


@Component({
  selector: 'app-lesson-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LessonInfoSectionComponent,
    ChaptersSectionComponent,
    AssignmentSectionComponent,
    PublishSuccessModalComponent,
    OutcomesEdit,
    ImageUpload,
    AcademicYears
  ],
  templateUrl: './lesson-editor-page-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LessonEditorPageComponent implements OnInit {
  readonly form: FormGroup;
  private route = inject(ActivatedRoute);
  id = this.route.snapshot.params['lessonId'];
  isPublishSuccessOpen = signal(false);
  draftSaved = false;
  private lessonService = inject(LessonService);
  private cdr = inject(ChangeDetectorRef);
  thumbnailPreview = signal<string | null>(null);
  assignmentFilePreview = signal<string | null>(null);
  loading = signal(false);
  prerequisitesOptions: { id: number; name: string }[] = [];
  allAcademicYears: { id: number; name: string }[] = [];
  private router = inject(Router);
    public readonly auth = inject(AuthService);

  private assignmentFile: File | null = null;
  private thumbnailFile: File | null = null;



  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [null, Validators.required],
      validityDays: [null],
      thumbnailFileName: [null as string | null],
      prerequisiteLessonId: null,
      outcomes: this.fb.array([]),
      videoMode: ['single' as VideoMode],
      lessonVideoFileName: [null as string | null],
      academicYearIds: this.fb.array([]),
      chapters: this.fb.array([
        this.createChapterGroup(),
      ]),

      assignmentEnabled: [false],
      assignmentDueDate: null,
      assignmentFileName: [null as string | null],
    });
  }
  ngOnInit(): void {
    this.lessonService.getLessonEditDetails(this.id).subscribe({
      next: (res) => {
        this.form.patchValue(res.data);
        this.allAcademicYears = res.data.allAcademicYearsOptions;
        this.chapters.clear();
        for (const chapter of res.data.chapters) {
          this.chapters.push(this.createChapterGroup(chapter.name, chapter.videoFileName));
        }
        this.form.get('assignmentDueDate')?.setValue(res.data.assignmentDueDate);
        this.form.get('assignmentFileName')?.setValue(res.data.assignmentFileName);
        this.assignmentFilePreview.set(res.data.assignmentFileName);
        this.form.get('thumbnailFileName')?.setValue(res.data.imageUrl);
        this.thumbnailPreview.set(res.data.imageUrl);
        this.outcomes.clear();
        for (const outcome of res.data.outcomes ?? []) {
          this.outcomes.push(this.fb.control(outcome));
        }
        this.prerequisitesOptions = res.data.prerequisitesOptions;

        this.academicYearIds.clear();
        for (const year of res.data.selectedAcademicYears) {
          this.academicYearIds.push(this.fb.control(year));
        }
        this.cdr.detectChanges();
      },
      error: () => {
      },
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
    private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as AppRole | undefined;
      navigateToMyLessons() {
      if (this.normalizedRole === AppRole.ASSISTANT) {
        this.router.navigate(['/dashboard/lessons']);
      } else if (this.normalizedRole === AppRole.TEACHER|| this.normalizedRole === AppRole.ADMIN) {
        this.router.navigate(['/dashboard/mylessons']);
      }

  }

  // بيبني FormData (multipart) فيه كل بيانات الدرس + ملف الواجب الحقيقي (لو اتغير)
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

    const chapters = (this.form.get('chapters')?.value ?? []) as { name: string; videoFileName: string | null }[];
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
    this.lessonService.updateLesson(this.id, this.buildLessonFormData(false)).subscribe({
      next: () => {
        this.draftSaved = true;
        setTimeout(() => (this.draftSaved = false), 2000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });

  }

  publish(): void {
    if (this.form.invalid) {
      toast.error('اكمل البيانات')
      return
    };
    this.loading.set(true);
    this.lessonService.updateLesson(this.id, this.buildLessonFormData(true)).subscribe({
      next: () => {
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
}