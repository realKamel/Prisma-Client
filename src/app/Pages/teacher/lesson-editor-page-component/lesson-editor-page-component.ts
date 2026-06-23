import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LessonInfoSectionComponent } from './component/lesson-info-section-component/lesson-info-section-component';
import { AssignmentSectionComponent } from './component/assignment-section-component/assignment-section-component';
import { ChaptersSectionComponent } from './component/chapters-section-component/chapters-section-component';
import { VideoMode } from './component/lesson-editor.types';
import { PublishSuccessModalComponent } from './component/publish-success-modal-component/publish-success-modal-component';
import { LessonService } from '../../../core/Services/lesson.service';
import { toast } from 'ngx-sonner';

export interface UpdatedLesson {
  title: string,
  description: string,
  price: number,
  validityDays: number,
  prerequisiteLessonId: number,
  chapters: Chapter[],
  assignmentEnabled: boolean,
  assignmentDueDate?: Date,
  assignmentFileTypes?: string
}
export interface Chapter {
  Name: string;
  VideoFileName?: string;
}

@Component({
  selector: 'app-lesson-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LessonInfoSectionComponent,
    ChaptersSectionComponent,
    AssignmentSectionComponent,
    PublishSuccessModalComponent,
  ],
  templateUrl: './lesson-editor-page-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LessonEditorPageComponent implements OnInit {
  readonly form: FormGroup;
  private route = inject(ActivatedRoute);
  id = this.route.snapshot.params['lessonId'];
  isPublishSuccessOpen = false;
  draftSaved = false;
  private lessonService = inject(LessonService);
  private cdr = inject(ChangeDetectorRef);
  lesson: UpdatedLesson = {} as UpdatedLesson

  loading: boolean = false;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [null, Validators.required],
      validityDays: [null],
      prerequisiteLessonId: null,

      videoMode: ['single' as VideoMode],
      lessonVideoFileName: [null as string | null],

      chapters: this.fb.array([
        this.createChapterGroup(''),
      ]),

      assignmentEnabled: [false],
      assignmentDueDate: null,
      assignmentFileTypes: null,
    });
  }
  ngOnInit(): void {

  }

  get chapters(): FormArray {
    return this.form.get('chapters') as FormArray;
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

  saveDraft(): void {
    // TODO: replace with the real save-draft API call
    this.draftSaved = true;
    setTimeout(() => (this.draftSaved = false), 2000);
  }

  publish(): void {
    if (this.form.invalid) {
      toast.error('اكمل البيانات')
      return
    };
    this.loading = true;
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
    }
    this.lessonService.updateLesson(this.id, this.lesson).subscribe({
      next: () => {
        this.isPublishSuccessOpen = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  closePublishSuccess(): void {
    this.isPublishSuccessOpen = false;
  }
}