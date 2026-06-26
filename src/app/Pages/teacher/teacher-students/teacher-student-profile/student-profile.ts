import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TeacherStudentsService } from '../../../../core/Services/teacher-students.service';
import { Student, StudentLesson, StudentActivity, StudentStats } from '../../../../core/Models/Teacher/student.model';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-profile.html',
})
export class StudentProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(TeacherStudentsService);
  private cdr = inject(ChangeDetectorRef);

  studentId = '';
  student: Student = { id: '', name: '', grade: '', lastActive: '', lessons: 0, avgQuiz: 0, active: false };
  loading = true;
  lessons: StudentLesson[] = [];
  activities: StudentActivity[] = [];
  stats: StudentStats = { lessons: 0, avgQuiz: 0, hours: 0, pending: 0 };
  removeLessonModal = false;
  lessonToRemove: StudentLesson | null = null;

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.studentId) {
      this.loadAllData();
    }
  }

  loadAllData() {
    this.loading = true;
    this.cdr.detectChanges();

    this.service.getStudent(this.studentId).subscribe({
      next: (res: Student) => {
        this.student = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.service.getStudentLessons(this.studentId).subscribe({
      next: (res: StudentLesson[]) => {
        this.lessons = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });

    this.service.getStudentActivities(this.studentId).subscribe({
      next: (res: StudentActivity[]) => {
        this.activities = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });

    this.service.getStudentStats(this.studentId).subscribe({
      next: (res: StudentStats) => {
        this.stats = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openRemoveModal(lesson: StudentLesson) {
    this.lessonToRemove = lesson;
    this.removeLessonModal = true;
    this.cdr.detectChanges();
  }

  confirmRemove() {
    if (this.lessonToRemove) {
      this.service.revokeLessonAccess(this.studentId, this.lessonToRemove.id).subscribe({
        next: () => {
          this.lessons = this.lessons.filter(l => l.id !== this.lessonToRemove!.id);
          this.lessonToRemove = null;
          this.removeLessonModal = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.removeLessonModal = false;
          this.lessonToRemove = null;
          this.cdr.detectChanges();
        }
      });
    }
  }

  closeRemoveModal() {
    this.removeLessonModal = false;
    this.lessonToRemove = null;
    this.cdr.detectChanges();
  }

  getInitials(name: string): string {
    const p = name.trim().split(' ');
    return p.length >= 2 ? p[0][0] + p[1][0] : p[0][0] || '';
  }

  get whatsappLink(): string {
    const num = this.student.parentPhone || this.student.phone || '';
    return `https://wa.me/2${num}`;
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }
}