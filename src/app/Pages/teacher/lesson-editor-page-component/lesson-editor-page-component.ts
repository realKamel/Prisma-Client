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
import { UpdatedLesson } from '../../../core/Models/Teacher/Teacherlesson.model';
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
  lesson: UpdatedLesson = {} as UpdatedLesson
  thumbnailPreview = signal<string | null>(null);
  loading = signal(false);
  prerequisitesOptions: { id: number; name: string }[] = [];
  allAcademicYears: { id: number; name: string }[] = [];
  private router = inject(Router);
    public readonly auth = inject(AuthService);



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
      assignmentFileTypes: null,
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
        this.form.get('assignmentFileTypes')?.setValue(res.data.assignmentFileTypes);
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
    private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as AppRole | undefined;
      navigateToMyLessons() {
      if (this.normalizedRole === AppRole.ASSISTANT) {
        this.router.navigate(['/dashboard/lessons']);
      } else if (this.normalizedRole === AppRole.TEACHER) {
        this.router.navigate(['/dashboard/mylessons']);
      }
  }


  saveDraft(): void {
    this.lesson = {
      title: this.form.get('title')?.value,
      description: this.form.get('description')?.value,
      price: this.form.get('price')?.value,
      validityDays: this.form.get('validityDays')?.value,
      prerequisiteLessonId: this.form.get('prerequisiteLessonId')?.value,
      chapters: this.form.get('chapters')?.value,
      assignmentEnabled: this.form.get('assignmentEnabled')?.value,
      assignmentDueDate: this.form.get('assignmentDueDate')?.value,
      assignmentFileTypes: this.form.get('assignmentFileTypes')?.value,
      isPublished: false, // or true for publish
      academicYearIds: this.form.get('academicYearIds')?.value,
      outcomes: this.form.get('outcomes')?.value,
      imageUrl: this.form.get('thumbnailFileName')?.value,
    }
    this.lessonService.updateLesson(this.id, this.lesson).subscribe({
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
    this.lesson = {
      title: this.form.get('title')?.value,
      description: this.form.get('description')?.value,
      price: this.form.get('price')?.value,
      validityDays: this.form.get('validityDays')?.value,
      prerequisiteLessonId: this.form.get('prerequisiteLessonId')?.value,
      chapters: this.form.get('chapters')?.value,
      assignmentEnabled: this.form.get('assignmentEnabled')?.value,
      assignmentDueDate: this.form.get('assignmentDueDate')?.value,
      assignmentFileTypes: this.form.get('assignmentFileTypes')?.value,
      isPublished: true,
      academicYearIds: this.form.get('academicYearIds')?.value,
      outcomes: this.form.get('outcomes')?.value,
      imageUrl: this.form.get('thumbnailFileName')?.value,
    }
    this.lessonService.updateLesson(this.id, this.lesson).subscribe({
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
