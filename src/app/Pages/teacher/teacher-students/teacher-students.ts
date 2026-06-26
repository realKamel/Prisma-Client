import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TeacherStudentsService } from '../../../core/Services/teacher-students.service';
import { Student, Lesson, AcademicYear } from '../../../core/Models/Teacher/student.model';

@Component({
  selector: 'app-teacher-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './teacher-students.html',
})
export class TeacherStudents implements OnInit {
  private service = inject(TeacherStudentsService);
  private cdr = inject(ChangeDetectorRef);

  students: Student[] = [];
  lessons: Lesson[] = [];
  gradeOptions: AcademicYear[] = [];

  loading = true;
  searchQuery = '';
  lessonFilter = 'all';
  gradeFilter = 'all';
  currentPage = 1;
  readonly pageSize = 10;

  ngOnInit() {
    forkJoin({
      students: this.service.getStudents(),
      lessons: this.service.getLessons(),
      grades: this.service.getAcademicYears(),
    }).subscribe({
      next: ({ students, lessons, grades }) => {
        this.students = students;
        this.lessons = lessons;
        this.gradeOptions = grades;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Filtering ──────────────────────────────────────────────────────────────

  get filtered(): Student[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.students.filter(s => {
      const matchName = !q || s.name.toLowerCase().includes(q);
      const matchGrade =
        this.gradeFilter === 'all' ||
        s.grade === this.gradeOptions.find(g => g.id.toString() === this.gradeFilter)?.name;
      const matchLesson =
        this.lessonFilter === 'all' ||
        (s.lessonTitles ?? []).includes(this.lessonFilter);
      return matchName && matchGrade && matchLesson;
    });
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

  get paginated(): Student[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get totalLessons(): number {
    return this.students.reduce((sum, s) => sum + s.lessons, 0);
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  scoreClass(n: number): string {
    if (n >= 80) return 'text-[var(--mint)]';
    if (n >= 60) return 'text-[var(--star)]';
    return 'text-[var(--coral)]';
  }
}