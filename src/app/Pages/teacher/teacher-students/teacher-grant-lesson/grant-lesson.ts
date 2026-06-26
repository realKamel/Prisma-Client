import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeacherStudentsService } from '../../../../core/Services/teacher-students.service';
import { Student, Lesson, GrantLessonRequest } from '../../../../core/Models/Teacher/student.model';

@Component({
  selector: 'app-grant-lesson',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './grant-lesson.html',
})
export class GrantLesson implements OnInit {
  private service = inject(TeacherStudentsService);
  private cdr = inject(ChangeDetectorRef);

  students: Student[] = [];
  lessons: Lesson[] = [];
  loadingStudents = true;
  loadingLessons = true;

  searchQuery = '';
  searchResults: Student[] = [];
  selectedStudent: Student | null = null;
  selectedLesson: Lesson | null = null;
  actionType: 'grant' | 'revoke' = 'grant';
  validityDays = 30;
  grantNote = '';
  loading = false;
  showSuccess = false;

  avatarColors = ['var(--purple)', '#2a6a5a', '#6a2a4a', '#2a4a6a', '#5a4a2a', '#4a2a6a'];

  ngOnInit() {
    this.service.getStudentsMock().subscribe({
      next: (res) => { this.students = res; this.loadingStudents = false; this.cdr.detectChanges(); },
      error: () => { this.loadingStudents = false; this.cdr.detectChanges(); }
    });
    this.service.getAllLessonsMock().subscribe({
      next: (res) => { this.lessons = res; this.loadingLessons = false; this.cdr.detectChanges(); },
      error: () => { this.loadingLessons = false; this.cdr.detectChanges(); }
    });
  }

  onSearch() {
    const q = this.searchQuery.trim();
    if (!q) {
      this.searchResults = [];
      return;
    }
    this.searchResults = this.students.filter(s => s.name.includes(q) || (s.phone || '').includes(q));
  }

  selectStudent(s: Student) {
    this.selectedStudent = s;
    this.searchQuery = '';
    this.searchResults = [];
  }

  clearStudent() {
    this.selectedStudent = null;
    this.selectedLesson = null;
  }

  selectLesson(l: Lesson) {
    this.selectedLesson = l;
  }

  get summaryLabel(): string {
    if (!this.selectedStudent && !this.selectedLesson) return 'اختار طالباً ودرساً أولاً';
    if (this.selectedStudent && !this.selectedLesson) return `${this.selectedStudent.name} — اختار الدرس اللي عايز تمنحه`;
    if (this.selectedStudent && this.selectedLesson) {
      const verb = this.actionType === 'grant' ? 'منح' : 'إلغاء منح';
      return `${verb} "${this.selectedLesson.title}" لـ ${this.selectedStudent.name}`;
    }
    return '';
  }

  get summaryMeta(): string {
    if (this.selectedStudent && this.selectedLesson) {
      return this.actionType === 'grant' ? `صلاحية ${this.toAr(this.validityDays)} يوم` : 'سيتم إلغاء الوصول فوراً';
    }
    return '';
  }

  get submitLabel(): string {
    return this.actionType === 'grant' ? 'منح الدرس' : 'إلغاء المنح';
  }

  submit() {
    if (!this.selectedStudent || !this.selectedLesson) return;
    this.loading = true;
    this.cdr.detectChanges();

    const request: GrantLessonRequest = {
      studentId: this.selectedStudent.id,
      lessonId: this.selectedLesson.id,
      actionType: this.actionType,
      validityDays: this.validityDays,
      note: this.grantNote || undefined
    };

    this.service.grantLessonMock(request).subscribe({
      next: () => { this.loading = false; this.showSuccess = true; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  reset() {
    this.showSuccess = false;
    this.selectedStudent = null;
    this.selectedLesson = null;
    this.actionType = 'grant';
    this.validityDays = 30;
    this.grantNote = '';
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }
}
