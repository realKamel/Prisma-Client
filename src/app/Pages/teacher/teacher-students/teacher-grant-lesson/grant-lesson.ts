import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TeacherStudentsService } from '../../../../core/Services/teacher-students.service';
import { Student, Lesson, GrantLessonRequest, StudentLesson } from '../../../../core/Models/Teacher/student.model';

@Component({
  selector: 'app-grant-lesson',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './grant-lesson.html',
})
export class GrantLesson implements OnInit {
  private service = inject(TeacherStudentsService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  students: Student[] = [];
  lessons: Lesson[] = [];
  loadingStudents = true;
  loadingLessons = true;

  searchQuery = '';
  searchResults: Student[] = [];
  selectedStudent: Student | null = null;
  selectedLesson: Lesson | null = null;
  actionType: 'grant' | 'revoke' = 'grant';  // ← ADDED BACK
  validityDays = 30;
  grantNote = '';
  loading = false;
  showSuccess = false;

  enrolledLessonIds = new Set<number>();

  avatarColors = ['var(--purple)', '#2a6a5a', '#6a2a4a', '#2a4a6a', '#5a4a2a', '#4a2a6a'];

  ngOnInit() {
    this.service.getStudents().subscribe({
      next: (res: Student[]) => {
        this.students = res;
        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingStudents = false;
        this.cdr.detectChanges();
      }
    });

    this.service.getAllLessons().subscribe({
      next: (res: Lesson[]) => {
        this.lessons = res;
        this.loadingLessons = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingLessons = false;
        this.cdr.detectChanges();
      }
    });

    const studentId = this.route.snapshot.queryParamMap.get('student');
    if (studentId) {
      const checkInterval = setInterval(() => {
        if (!this.loadingStudents) {
          clearInterval(checkInterval);
          const student = this.students.find(s => s.id === studentId);
          if (student) {
            this.selectStudent(student);
          }
        }
      }, 100);
    }
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
    this.selectedLesson = null;
    this.actionType = 'grant';  // ← reset to grant
    this.service.getStudentLessons(s.id).subscribe({
      next: (lessons: StudentLesson[]) => {
        this.enrolledLessonIds = new Set(lessons.map(l => l.id));
        this.cdr.detectChanges();
      },
      error: () => {
        this.enrolledLessonIds.clear();
        this.cdr.detectChanges();
      }
    });
    this.cdr.detectChanges();
  }

  clearStudent() {
    this.selectedStudent = null;
    this.selectedLesson = null;
    this.enrolledLessonIds.clear();
    this.actionType = 'grant';
  }

  selectLesson(l: Lesson) {
    this.selectedLesson = l;
    if (this.enrolledLessonIds.has(l.id)) {
      this.actionType = 'revoke';
    } else {
      this.actionType = 'grant';
    }
  }

  get isLessonEnrolled(): boolean {
    return this.selectedLesson !== null && this.enrolledLessonIds.has(this.selectedLesson.id);
  }

  get canGrant(): boolean {
    return this.selectedLesson !== null && !this.enrolledLessonIds.has(this.selectedLesson.id);
  }

  get canRevoke(): boolean {
    return this.selectedLesson !== null && this.enrolledLessonIds.has(this.selectedLesson.id);
  }

  get summaryLabel(): string {
    if (!this.selectedStudent && !this.selectedLesson) return 'اختار طالباً ودرساً أولاً';
    if (this.selectedStudent && !this.selectedLesson) return `${this.selectedStudent.name} — اختار الدرس اللي عايز تمنحه`;
    if (this.selectedStudent && this.selectedLesson) {
      if (this.enrolledLessonIds.has(this.selectedLesson.id)) {
        return `إلغاء منح "${this.selectedLesson.title}" لـ ${this.selectedStudent.name}`;
      }
      return `منح "${this.selectedLesson.title}" لـ ${this.selectedStudent.name}`;
    }
    return '';
  }

  get summaryMeta(): string {
    if (this.selectedStudent && this.selectedLesson) {
      if (this.enrolledLessonIds.has(this.selectedLesson.id)) {
        return 'سيتم إلغاء الوصول فوراً';
      }
      return `صلاحية ${this.toAr(this.validityDays)} يوم`;
    }
    return '';
  }

  get submitLabel(): string {
    if (!this.selectedLesson) return 'منح الدرس';
    return this.enrolledLessonIds.has(this.selectedLesson.id) ? 'إلغاء المنح' : 'منح الدرس';
  }

  submit() {
    if (!this.selectedStudent || !this.selectedLesson) return;
    this.loading = true;
    this.cdr.detectChanges();

    if (this.enrolledLessonIds.has(this.selectedLesson.id)) {
      this.service.revokeLessonAccess(this.selectedStudent.id, this.selectedLesson.id).subscribe({
        next: () => {
          this.loading = false;
          this.showSuccess = true;
          this.enrolledLessonIds.delete(this.selectedLesson!.id);
          this.actionType = 'grant';
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      const request: GrantLessonRequest = {
        studentId: this.selectedStudent.id,
        lessonId: this.selectedLesson.id,
        validityDays: this.validityDays,
        note: this.grantNote || undefined
      };

      this.service.grantLesson(request).subscribe({
        next: () => {
          this.loading = false;
          this.showSuccess = true;
          this.enrolledLessonIds.add(this.selectedLesson!.id);
          this.actionType = 'grant';
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  reset() {
    this.showSuccess = false;
    this.selectedStudent = null;
    this.selectedLesson = null;
    this.actionType = 'grant';
    this.validityDays = 30;
    this.grantNote = '';
    this.enrolledLessonIds.clear();
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }
}