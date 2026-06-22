import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LessonInfoSectionComponent } from './component/lesson-info-section-component/lesson-info-section-component';
import { AssignmentSectionComponent } from './component/assignment-section-component/assignment-section-component';
import { ChaptersSectionComponent } from './component/chapters-section-component/chapters-section-component';
import { VideoMode } from './component/lesson-editor.types';
import { PublishSuccessModalComponent } from './component/publish-success-modal-component/publish-success-modal-component';


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
export class LessonEditorPageComponent {
  readonly form: FormGroup;

  isPublishSuccessOpen = false;
  draftSaved = false;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [null, Validators.required],
      validityDays: [null],
      prerequisiteLessonId: [''],

      videoMode: ['single' as VideoMode],
      lessonVideoFileName: [null as string | null],

      chapters: this.fb.array([
        this.createChapterGroup('مقدمة عن الشحنات الكهربائية'),
        this.createChapterGroup('قانون كولوم والتطبيقات'),
      ]),


      assignmentEnabled: [false],
      assignmentDescription: [''],
      assignmentDueDate: [''],
      assignmentFileTypes: ['pdf-word-images'],
    });
  }

  get chapters(): FormArray {
    return this.form.get('chapters') as FormArray;
  }

  get quizQuestions(): FormArray {
    return this.form.get('quizQuestions') as FormArray;
  }

  private createChapterGroup(name = ''): FormGroup {
    return this.fb.group({
      name: [name],
      videoFileName: [null as string | null],
    });
  }

  private createQuestionGroup(text = '', options: string[] = ['', '', '', ''], correctIndex = 0): FormGroup {
    return this.fb.group({
      type: ['mcq'],
      text: [text],
      options: this.fb.array(options.map((value) => this.fb.control(value))),
      correctOptionIndex: [correctIndex],
      trueFalseCorrectIndex: [null as number | null],
      modelAnswer: [''],
    });
  }

  onVideoModeChange(mode: VideoMode): void {
    this.form.get('videoMode')?.setValue(mode);
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

  addQuestion(): void {
    this.quizQuestions.push(this.createQuestionGroup());
  }

  removeQuestion(index: number): void {
    this.quizQuestions.removeAt(index);
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
    // TODO: replace with the real publish API call
    this.isPublishSuccessOpen = true;
  }

  closePublishSuccess(): void {
    this.isPublishSuccessOpen = false;
  }
}