import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeacherStudentsService } from '../../../core/Services/teacher-students.service';
import { Student } from '../../../core/Models/Teacher/student.model';

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
  loading = true;
  searchQuery = '';
  lessonFilter = 'all';
  gradeFilter = 'all';
  currentPage = 1;
  pageSize = 5;

  readonly gradeOptions = ['all', 'ثانوية ١', 'ثانوية ٢', 'ثانوية ٣', 'إعدادية ٣'];
  readonly lessonOptions = ['all', 'الكهرباء الساكنة', 'قوانين نيوتن', 'الموجات الصوتية', 'المغناطيسية'];

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading = true;
    this.cdr.detectChanges();
    this.service.getStudentsMock().subscribe({
      next: (res) => {
        this.students = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filtered(): Student[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.students.filter(s => {
      const matchQ = !q || s.name.toLowerCase().includes(q);
      const matchG = this.gradeFilter === 'all' || s.grade === this.gradeFilter;
      return matchQ && matchG;
    });
  }

  get paginated(): Student[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }

  scoreClass(n: number): string {
    if (n >= 80) return 'text-[var(--mint)]';
    if (n >= 60) return 'text-[var(--star)]';
    return 'text-[var(--coral)]';
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  onFilterChange() {
    this.currentPage = 1;
  }
}
