import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { VideoMode } from './component/lesson-editor.types';
import { LessonInfoSectionAddComponent } from "./component/lesson-info-section-component/lesson-info-section-component";
import { ChaptersSectionAddComponent } from "./component/chapters-section-component/chapters-section-component";
import { AssignmentSectionAddComponent } from "./component/assignment-section-component/assignment-section-component";
import { CommonModule } from '@angular/common';
import { CreatedLesson } from '../../../core/Models/Teacher/Teacherlesson.model';
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
  lesson: CreatedLesson = {} as CreatedLesson;
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
      validityDays: [null],
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
      assignmentFileTypes: null,
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

  onThumbnailSelected(fileName: string): void {
    this.form.get('thumbnailFileName')?.setValue(fileName || null);
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

  private buildLesson(isPublished: boolean): CreatedLesson {
    return {
      title: this.form.get('title')?.value,
      description: this.form.get('description')?.value,
      price: this.form.get('price')?.value,
      validityDays: this.form.get('validityDays')?.value,
      prerequisiteLessonId: this.form.get('prerequisiteLessonId')?.value,
      chapters: this.form.get('chapters')?.value,
      assignmentEnabled: this.form.get('assignmentEnabled')?.value,
      assignmentDueDate: this.form.get('assignmentDueDate')?.value,
      assignmentFileTypes: this.form.get('assignmentFileTypes')?.value,
      isPublished,
      outcomes: this.form.get('outcomes')?.value,
      academicYearIds: this.form.get('academicYearIds')?.value,
      imageUrl: this.form.get('thumbnailFileName')?.value,
    };
  }

  saveDraft(): void {
    this.lessonService.addLesson(this.buildLesson(false)).subscribe({
      next: () => {
        this.draftSaved.set(true);
        setTimeout(() => this.draftSaved.set(false), 2000);
      },
    });
  }
      private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as AppRole | undefined;
      navigateToMyLessons() {
      if (this.normalizedRole === AppRole.ASSISTANT) {
        this.router.navigate(['/dashboard/lessons']);
      } else if (this.normalizedRole === AppRole.TEACHER) {
        this.router.navigate(['/dashboard/mylessons']);
      }
  }

  publish(): void {
    if (this.form.invalid) {
      toast.error('اكمل البيانات');
      return;
    }
    this.loading.set(true);
    this.lessonService.addLesson(this.buildLesson(true)).subscribe({
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
  }
}
