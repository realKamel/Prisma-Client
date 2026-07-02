import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { VideoMode } from './component/lesson-editor.types';
import { LessonInfoSectionAddComponent } from "./component/lesson-info-section-component/lesson-info-section-component";
import { ChaptersSectionAddComponent } from "./component/chapters-section-component/chapters-section-component";
import { AssignmentSectionAddComponent } from "./component/assignment-section-component/assignment-section-component";
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { LessonService } from '../../../core/Services/lesson.service';
import { Router, RouterLink } from '@angular/router';
import { PublishSuccessModalAddComponent } from './component/publish-success-modal-component/publish-success-modal-component';
import { OutcomesAdd } from './component/outcomes-edit/outcomes-edit';
import { ImageUploadAdd } from './component/image-upload/image-upload';
import { AcademicYearsAdd } from './component/academic-years/academic-years';
import { AppRole } from '../../../core/enums/role-enum';
import { AuthService } from '../../../core/Services/auth';

@Component({
  selector: 'app-add-lesson-component',
  imports: [
    PublishSuccessModalAddComponent,
    LessonInfoSectionAddComponent,
    ChaptersSectionAddComponent,
    AssignmentSectionAddComponent,
    CommonModule,
    ReactiveFormsModule,
    OutcomesAdd,
    ImageUploadAdd,
    AcademicYearsAdd,
  ],
  templateUrl: './add-lesson-component.html',
  styleUrl: './add-lesson-component.css',
})
export class AddLessonComponent implements OnInit {
  readonly form: FormGroup;
  loading = signal(false);
  isPublishSuccessOpen = signal(false);
  draftSaved = signal(false);

  // الملفات الحقيقية (الواجب + صورة الغلاف)، بنخزنهم هنا لحد ما نبعتهم في الـ FormData
  private assignmentFile: File | null = null;
  private thumbnailFile: File | null = null;

  private lessonService = inject(LessonService);
  private cdr = inject(ChangeDetectorRef);

  allAcademicYears: { id: number; name: string }[] = [];
  prerequisitesOptions: { id: number; name: string }[] = [];
  private router = inject(Router);
  public readonly auth = inject(AuthService);

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [null, Validators.required],
      prerequisiteLessonId: [null],
      thumbnailFileName: [null as string | null],
      outcomes: this.fb.array([]),
      videoMode: ['single' as VideoMode],
      lessonVideoFileName: [null as string | null],
      chapters: this.fb.array([
        this.createChapterGroup(),
      ]),
      assignmentEnabled: [false],
      assignmentDueDate: null,
      assignmentFileName: [null as string | null],
      academicYearIds: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.lessonService.getLessonFormOptions().subscribe({
      next: (res) => {
        this.allAcademicYears = res.data.allAcademicYearsOptions;
        this.prerequisitesOptions = res.data.prerequisitesOptions;
        this.cdr.detectChanges();
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

  // بقى بياخد الـ File الحقيقي من app-assignment-section-add، مش اسمه بس
  onAssignmentFileSelected(file: File | null): void {
    this.assignmentFile = file;
    this.form.get('assignmentFileName')?.setValue(file ? file.name : null);
  }

  // بيبني FormData (multipart) فيه كل بيانات الدرس + ملف الواجب الحقيقي
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

    // ده السطر المهم: بيبعت بيانات الملف نفسه (binary)، مش بس الاسم
    if (this.assignmentFile) {
      fd.append('assignmentFile', this.assignmentFile, this.assignmentFile.name);
    }

    return fd;
  }

  disableDraft = signal(false);
  saveDraft(): void {
    this.disableDraft.set(true);
    this.lessonService.addLesson(this.buildLessonFormData(false)).subscribe({
      next: () => {
        this.disableDraft.set(false);
        this.draftSaved.set(true);
        setTimeout(() => this.draftSaved.set(false), 2000);
        this.navigateToMyLessons();
      },
      error: () => {
        this.disableDraft.set(false);
      },
    });

  }

  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as AppRole | undefined;
  navigateToMyLessons() {
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
      next: () => {
        this.loading.set(false);
        this.isPublishSuccessOpen.set(true);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  closePublishSuccess(): void {
    this.isPublishSuccessOpen.set(false);
    this.navigateToMyLessons();
  }
}