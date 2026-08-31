import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeacherStudentsService } from '../../../../core/Services/teacher-students.service';
import {
  Student,
  Lesson,
  GrantLessonRequest,
  StudentLesson,
} from '../../../../core/Models/Teacher/student.model';
import { DecimalPipe } from '@angular/common';
import { first } from 'rxjs';

@Component({
  selector: 'app-grant-lesson',
  imports: [FormsModule, RouterModule, DecimalPipe],
  templateUrl: './grant-lesson.html',
})
export class GrantLesson implements OnInit {
  private readonly service = inject(TeacherStudentsService);

  // Router Query Parameters mapped directly to Input Signals
  // Requires 'withComponentInputBinding()' configured in your Application Routing providers
  readonly student = input<string | null>(null);

  // Core Collection Signals
  readonly students = signal<Student[]>([]);
  readonly lessons = signal<Lesson[]>([]);
  readonly enrolledLessonIds = signal<Set<number>>(new Set());
  readonly searchResults = signal<Student[]>([]);

  // Loading & View Control Signals
  readonly loadingStudents = signal(true);
  readonly loadingLessons = signal(true);
  readonly loading = signal(false);
  readonly showSuccess = signal(false);

  // Form Field State Signals
  readonly searchQuery = signal('');
  readonly selectedStudent = signal<Student | null>(null);
  readonly selectedLesson = signal<Lesson | null>(null);
  readonly actionType = signal<'grant' | 'revoke'>('grant');
  readonly validityDays = signal(30);
  readonly grantNote = signal('');

  readonly avatarColors = ['var(--color-primary)', '#2a6a5a', '#6a2a4a', '#2a4a6a', '#5a4a2a', '#4a2a6a'];

  // Pure Computed Selectors (Replaces old overhead getters)
  readonly isLessonEnrolled = computed(() => {
    const lesson = this.selectedLesson();
    return lesson !== null && this.enrolledLessonIds().has(lesson.id);
  });

  readonly canGrant = computed(() => {
    const lesson = this.selectedLesson();
    return lesson !== null && !this.enrolledLessonIds().has(lesson.id);
  });

  readonly canRevoke = computed(() => {
    const lesson = this.selectedLesson();
    return lesson !== null && this.enrolledLessonIds().has(lesson.id);
  });

  readonly summaryLabel = computed(() => {
    const s = this.selectedStudent();
    const l = this.selectedLesson();

    if (!s && !l) return 'اختار طالباً ودرساً أولاً';
    if (s && !l) return `${s.name} — اختار الدرس اللي عايز تمنحه`;
    if (s && l) {
      return this.enrolledLessonIds().has(l.id)
        ? `إلغاء منح "${l.title}" لـ ${s.name}`
        : `منح "${l.title}" لـ ${s.name}`;
    }
    return '';
  });

  readonly summaryMeta = computed(() => {
    const s = this.selectedStudent();
    const l = this.selectedLesson();
    if (s && l) {
      return this.enrolledLessonIds().has(l.id)
        ? 'سيتم إلغاء الوصول فوراً'
        : `صلاحية ${this.validityDays()} يوم`;
    }
    return '';
  });

  readonly submitLabel = computed(() => {
    const l = this.selectedLesson();
    if (!l) return 'منح الدرس';
    return this.enrolledLessonIds().has(l.id) ? 'إلغاء المنح' : 'منح الدرس';
  });

  constructor() {
    // Replaces the old setInterval poll by running reactively when parameters or lists change
    effect(() => {
      const targetId = this.student();
      const studentList = this.students();
      const isLoading = this.loadingStudents();

      if (targetId && !isLoading && studentList.length > 0) {
        const foundStudent = studentList.find((s) => s.id === targetId);
        if (foundStudent && this.selectedStudent()?.id !== foundStudent.id) {
          this.selectStudent(foundStudent);
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadLessons();
  }

  private loadStudents(): void {
    this.service
      .getStudents()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.students.set(res);
          this.loadingStudents.set(false);
        },
        error: () => this.loadingStudents.set(false),
      });
  }

  private loadLessons(): void {
    this.service
      .getAllLessons()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.lessons.set(res);
          this.loadingLessons.set(false);
        },
        error: () => this.loadingLessons.set(false),
      });
  }

  onSearch(): void {
    const q = this.searchQuery().trim();
    if (!q) {
      this.searchResults.set([]);
      return;
    }
    this.searchResults.set(
      this.students().filter((s) => s.name.includes(q) || (s.phone || '').includes(q)),
    );
  }

  selectStudent(s: Student): void {
    this.selectedStudent.set(s);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.selectedLesson.set(null);
    this.actionType.set('grant');

    this.service
      .getStudentLessons(s.id)
      .pipe(first())
      .subscribe({
        next: (lessons: StudentLesson[]) => {
          this.enrolledLessonIds.set(new Set(lessons.map((l) => l.id)));
        },
        error: () => this.enrolledLessonIds.set(new Set()),
      });
  }

  clearStudent(): void {
    this.selectedStudent.set(null);
    this.selectedLesson.set(null);
    this.enrolledLessonIds.set(new Set());
    this.actionType.set('grant');
  }

  selectLesson(l: Lesson): void {
    this.selectedLesson.set(l);
    this.actionType.set(this.enrolledLessonIds().has(l.id) ? 'revoke' : 'grant');
  }

  submit(): void {
    const student = this.selectedStudent();
    const lesson = this.selectedLesson();
    if (!student || !lesson) return;

    this.loading.set(true);

    // Grant vs revoke is derived from live enrollment state so the request
    // always matches what's rendered on screen.
    const revoking = this.enrolledLessonIds().has(lesson.id);

    const request$ = revoking
      ? this.service.revokeLessonAccess(student.id, lesson.id)
      : this.service.grantLesson({
          studentId: student.id,
          lessonId: lesson.id,
          validityDays: this.validityDays(),
          note: this.grantNote() || undefined,
        } satisfies GrantLessonRequest);

    request$.pipe(first()).subscribe({
      next: () => this.onSubmitSuccess(lesson.id, revoking),
      error: () => this.loading.set(false),
    });
  }

  private onSubmitSuccess(lessonId: number, granted: boolean): void {
    this.loading.set(false);
    this.showSuccess.set(true);
    this.updateEnrollment(lessonId, granted);
    this.actionType.set('grant');
  }

  private updateEnrollment(lessonId: number, granted: boolean): void {
    this.enrolledLessonIds.update((ids) => {
      const next = new Set(ids);
      if (granted) {
        next.add(lessonId);
      } else {
        next.delete(lessonId);
      }
      return next;
    });
  }

  reset(): void {
    this.showSuccess.set(false);
    this.selectedStudent.set(null);
    this.selectedLesson.set(null);
    this.actionType.set('grant');
    this.validityDays.set(30);
    this.grantNote.set('');
    this.enrolledLessonIds.set(new Set());
  }
}
