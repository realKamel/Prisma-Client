import { Component, OnInit, inject, signal, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TeacherStudentsService } from '../../../../core/Services/teacher-students.service';
import {
  Student,
  StudentLesson,
  StudentActivity,
  StudentStats,
} from '../../../../core/Models/Teacher/student.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-student-profile',
  imports: [RouterModule, DecimalPipe],
  templateUrl: './student-profile.html',
})
export class StudentProfile implements OnInit {
  private service = inject(TeacherStudentsService);

  // Router input binding captures the ':id' path variable automatically
  readonly id = input<string>('');

  protected readonly student = signal<Student>({
    id: '',
    name: '',
    grade: '',
    lastActive: '',
    lessons: 0,
    avgQuiz: 0,
    active: false,
  });

  protected readonly loading = signal(true);
  protected readonly lessons = signal<StudentLesson[]>([]);
  protected readonly activities = signal<StudentActivity[]>([]);
  protected readonly stats = signal<StudentStats>({ lessons: 0, avgQuiz: 0, hours: 0, pending: 0 });

  // Modal state signals
  protected readonly removeLessonModal = signal(false);
  protected readonly lessonToRemove = signal<StudentLesson | null>(null);

  ngOnInit() {
    if (this.id()) {
      this.loadAllData();
    }
  }

  loadAllData() {
    this.loading.set(true);

    // Using forkJoin handles parallel execution safely and turns off loading at the correct time
    forkJoin({
      student: this.service.getStudent(this.id()),
      lessons: this.service.getStudentLessons(this.id()),
      activities: this.service.getStudentActivities(this.id()),
      stats: this.service.getStudentStats(this.id()),
    }).subscribe({
      next: ({ student, lessons, activities, stats }) => {
        this.student.set(student);
        this.lessons.set(lessons);
        this.activities.set(activities);
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load student dashboard data', err);
        this.loading.set(false);
      },
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  openRemoveModal(lesson: StudentLesson) {
    this.lessonToRemove.set(lesson);
    this.removeLessonModal.set(true);
  }

  confirmRemove() {
    const targetLesson = this.lessonToRemove();
    if (!targetLesson) return;

    this.service.revokeLessonAccess(this.id(), targetLesson.id).subscribe({
      next: () => {
        // Safe state update without modifying raw arrays directly
        this.lessons.update((prev) => prev.filter((l) => l.id !== targetLesson.id));
        this.lessonToRemove.set(null);
        this.removeLessonModal.set(false);
      },
      error: (err) => {
        console.error('Failed to revoke lesson access', err);
        this.closeRemoveModal();
      },
    });
  }

  closeRemoveModal() {
    this.removeLessonModal.set(false);
    this.lessonToRemove.set(null);
  }

  // ── Computed Signals ───────────────────────────────────────────────────────
  protected readonly whatsappLink = computed(() => {
    const s = this.student();
    const num = s.parentPhone || s.phone || '';
    return `https://wa.me/2${num}`;
  });

  // ── Pure Helpers ───────────────────────────────────────────────────────────
  getInitials(name: string): string {
    const p = name.trim().split(' ');
    return p.length >= 2 ? p[0][0] + p[1][0] : p[0][0] || '';
  }
}
