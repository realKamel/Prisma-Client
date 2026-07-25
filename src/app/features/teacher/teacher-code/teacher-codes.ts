import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodesService } from '../../../core/Services/codes.service';
import type {
  AcademicYear,
  Lesson,
  CodeBatch,
} from '../../../core/Models/Teacher/teacher-codes.module';
import { DecimalPipe } from '@angular/common';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-teacher-codes',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './teacher-codes.html',
})
export class TeacherCodesComponent implements OnInit {
  private readonly codesService = inject(CodesService);

  // ── Raw data ──
  protected readonly academicYears = signal<AcademicYear[]>([]);
  protected readonly lessons = signal<Lesson[]>([]);
  protected readonly allBatches = signal<CodeBatch[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  // ── Filters ──
  selectedAcademicYearId = signal<number | ''>('');
  selectedLessonId = signal<number | ''>('');
  searchQuery = signal('');
  statusFilter = signal<'all' | 'active' | 'used'>('all');

  // ── Derived: lessons for filter dropdown ──
  // No academic year selected → all lessons deduplicated by id.
  // Academic year selected → only that year's lessons, also deduplicated.
  protected readonly lessonsForFilter = computed(() => {
    const ayId = this.selectedAcademicYearId();
    const all = this.lessons();

    if (ayId === '') {
      const seen = new Set<number>();
      return all.filter((l) => {
        if (seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
      });
    }

    const seen = new Set<number>();
    return all
      .filter((l) => l.academicYearId === Number(ayId))
      .filter((l) => {
        if (seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
      });
  });

  // ── Derived: filtered batches ──
  protected readonly filteredBatches = computed(() => {
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

  private loadAcademicYears() {
    this.codesService.getAcademicYears().subscribe((res) => {
      this.academicYears.set(res.data);
      if (res.fromFallback) this.error.set(true);
    });
  }

  private loadLessons() {
    this.codesService.getLessons().subscribe((res) => {});
    this.codesService.getLessons().subscribe({
      next: (res) => {
        this.lessons.set(res.data);
        if (res.fromFallback) {
          this.error.set(true);
        }
      },
      error: (error) => {
        toast.error(error.message);
      },
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
}
