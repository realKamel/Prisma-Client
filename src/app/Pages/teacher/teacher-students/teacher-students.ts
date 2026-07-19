import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TeacherStudentsService } from '../../../core/Services/teacher-students.service';
import { Student, Lesson, AcademicYear } from '../../../core/Models/Teacher/student.model';

@Component({
  selector: 'app-teacher-students',
  imports: [FormsModule, RouterModule, DecimalPipe],
  templateUrl: './teacher-students.html',
})
export class TeacherStudents implements OnInit {
  private service = inject(TeacherStudentsService);

  protected readonly students = signal<Student[]>([]);
  protected readonly lessons = signal<Lesson[]>([]);
  protected readonly gradeOptions = signal<AcademicYear[]>([]);

  protected readonly loading = signal(true);
  protected readonly searchQuery = signal('');
  protected readonly lessonFilter = signal('all');
  protected readonly gradeFilter = signal('all');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  ngOnInit() {
    forkJoin({
      students: this.service.getStudents(),
      lessons: this.service.getLessons(),
      grades: this.service.getAcademicYears(),
    }).subscribe({
      next: ({ students, lessons, grades }) => {
        this.students.set(
          students.map((s) => ({
            ...s,
            active: s.lessons > 0,
          })),
        );
        this.lessons.set(lessons);
        this.gradeOptions.set(grades);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  // ── Filtering ──────────────────────────────────────────────────────────────

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const currentStudents = this.students();
    const currentGrades = this.gradeOptions();
    const currentGradeFilter = this.gradeFilter();
    const currentLessonFilter = this.lessonFilter();

    return currentStudents.filter((s) => {
      const matchName = !q || s.name.toLowerCase().includes(q);

      const matchGrade =
        currentGradeFilter === 'all' ||
        s.grade === currentGrades.find((g) => g.id.toString() === currentGradeFilter)?.name;

      const matchLesson =
        currentLessonFilter === 'all' || (s.lessonTitles ?? []).includes(currentLessonFilter);

      return matchName && matchGrade && matchLesson;
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  protected readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  protected readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filtered().length / this.pageSize()));
  });

  protected readonly totalLessons = computed(() => {
    return this.students().reduce((sum, s) => sum + s.lessons, 0);
  });

  changePage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
  }

  onFilterChange() {
    this.currentPage.set(1);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  scoreClass(n: number): string {
    if (n >= 80) return 'text-[var(--mint)]';
    if (n >= 60) return 'text-[var(--star)]';
    return 'text-[var(--coral)]';
  }
}
