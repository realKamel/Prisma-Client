import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute);

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

  // Track which lessonIds are already enrolled for the selected student
  enrolledLessonIds = new Set<number>();

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

    // Pre-select student from query param
    const studentId = this.route.snapshot.queryParamMap.get('student');
    if (studentId) {
      const id = +studentId;
      // Wait for students to load then select
      const checkInterval = setInterval(() => {
        if (!this.loadingStudents) {
          clearInterval(checkInterval);
          const student = this.students.find(s => s.id === id);
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
    this.actionType = 'grant';
    // TODO: Call backend to get enrolled lesson IDs for this student
    // this.service.getStudentLessons(s.id).subscribe({
    //   next: (lessons) => {
    //     this.enrolledLessonIds = new Set(lessons.map(l => l.id));
    //     this.cdr.detectChanges();
    //   }
    // });
    this.cdr.detectChanges();
  }

  clearStudent() {
    this.selectedStudent = null;
    this.selectedLesson = null;
    this.enrolledLessonIds.clear();
  }

  selectLesson(l: Lesson) {
    this.selectedLesson = l;
    // Auto-set action type based on enrollment status
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

    const request: GrantLessonRequest = {
      studentId: this.selectedStudent.id,
      lessonId: this.selectedLesson.id,
      actionType: this.actionType,
      validityDays: this.validityDays,
      note: this.grantNote || undefined
    };

    this.service.grantLessonMock(request).subscribe({
      next: () => { 
        this.loading = false; 
        this.showSuccess = true; 
        // Update local enrollment state
        if (this.actionType === 'grant') {
          this.enrolledLessonIds.add(this.selectedLesson!.id);
        } else {
          this.enrolledLessonIds.delete(this.selectedLesson!.id);
        }
        this.cdr.detectChanges(); 
      },
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
    this.enrolledLessonIds.clear();
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }
}