import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { VideoMode } from './component/lesson-editor.types';
import { LessonInfoSectionComponent } from "./component/lesson-info-section-component/lesson-info-section-component";
import { ChaptersSectionComponent } from "./component/chapters-section-component/chapters-section-component";
import { AssignmentSectionComponent } from "./component/assignment-section-component/assignment-section-component";
import { CommonModule } from '@angular/common';
import { CreatedLesson } from '../../../core/Models/Teacher/Teacherlesson.model';
import { toast } from 'ngx-sonner';
import { LessonService } from '../../../core/Services/lesson.service';
import { RouterLink } from '@angular/router';
import { PublishSuccessModalComponent } from './component/publish-success-modal-component/publish-success-modal-component';
@Component({
  selector: 'app-add-lesson-component',
  imports: [RouterLink, PublishSuccessModalComponent, LessonInfoSectionComponent, ChaptersSectionComponent, AssignmentSectionComponent,CommonModule,ReactiveFormsModule],
  templateUrl: './add-lesson-component.html',
  styleUrl: './add-lesson-component.css',
})
export class AddLessonComponent { 
  readonly form: FormGroup;
  loading:boolean=false;
  isPublishSuccessOpen = false;
  draftSaved = false;
  lesson: CreatedLesson = {} as CreatedLesson
  private lessonService = inject(LessonService);
  private cdr = inject(ChangeDetectorRef);
  
  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [null, Validators.required],
      validityDays: [null],
      prerequisiteLessonId: [null],

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
      isPublished: false
    }
    this.lessonService.addLesson(this.lesson).subscribe({
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
       isPublished: true
     }
     this.lessonService.addLesson(this.lesson).subscribe({
       next: () => {
         this.isPublishSuccessOpen = true;
         this.loading = false;
         this.cdr.detectChanges();
       },
       error: (err) => {
        console.log(err.error)
         this.loading = false;
         
         this.cdr.detectChanges();
       },
     });
   }

  closePublishSuccess(): void {
    this.isPublishSuccessOpen = false;
  }
}