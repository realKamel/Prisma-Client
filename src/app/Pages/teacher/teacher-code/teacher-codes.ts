import {
  Component,
  signal,
  computed,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CodesService } from '../../../core/Services/codes.service';
import type { AcademicYear, Lesson, CodeBatch } from '../../../core/Models/Teacher/teacher-codes.module';

@Component({
  selector: 'app-teacher-codes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './teacher-codes.html',
})
export class TeacherCodesComponent implements OnInit {
  private codesService = inject(CodesService);

  // ── Raw data ──
  academicYears = signal<AcademicYear[]>([]);
  lessons = signal<Lesson[]>([]);
  allBatches = signal<CodeBatch[]>([]);
  loading = signal(false);
  error = signal(false);

  // ── Filters ──
  selectedAcademicYearId = signal<number | ''>('');
  selectedLessonId = signal<number | ''>('');
  searchQuery = signal('');
  statusFilter = signal<'all' | 'active' | 'used'>('all');

  // ── Derived: lessons filtered by academic year ──
  availableLessons = computed(() => {
    const ayId = this.selectedAcademicYearId();
    if (ayId === '') return [];
    return this.lessons().filter((l) => l.academicYearId === Number(ayId));
  });

  // ── Derived: filtered batches ──
  filteredBatches = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const ayId = this.selectedAcademicYearId();
    const lessonId = this.selectedLessonId();

    return this.allBatches().filter((b) => {
      const matchQ = !q || b.lesson.toLowerCase().includes(q);
      const matchStatus =
        status === 'all' ||
        (status === 'active' && b.usedCodes < b.totalCodes) ||
        (status === 'used' && b.usedCodes === b.totalCodes);
      const matchAY = ayId === '' || b.academicYearId === Number(ayId);
      const matchLesson = lessonId === '' || b.lessonId === Number(lessonId);
      return matchQ && matchStatus && matchAY && matchLesson;
    });
  });

  ngOnInit() {
    this.loadAcademicYears();
    this.loadLessons();
    this.loadBatches();
  }

  // ── Loaders via service ──
  private loadAcademicYears() {
    this.codesService.getAcademicYears().subscribe((res) => {
      this.academicYears.set(res.data);
      if (res.fromFallback) this.error.set(true);
    });
  }

  private loadLessons() {
    this.codesService.getLessons().subscribe((res) => {
      this.lessons.set(res.data);
      if (res.fromFallback) this.error.set(true);
    });
  }

  private loadBatches() {
    this.loading.set(true);
    this.codesService.getBatches().subscribe((res) => {
      this.allBatches.set(res.data);
      if (res.fromFallback) this.error.set(true);
      this.loading.set(false);
    });
  }

  onAcademicYearChange() {
    this.selectedLessonId.set('');
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
  }
}
