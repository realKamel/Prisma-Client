import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { toast } from 'ngx-sonner';
import type {
  AcademicYear,
  CodeBatch,
  Lesson,
} from '../../../core/Models/Teacher/teacher-codes.module';
import { CodesService } from '../../../core/Services/codes.service';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-teacher-codes',
  imports: [RouterLink, DecimalPipe, DatePipe, NgmMotionDirective, SearchInputComponent],
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
  protected readonly selectedAcademicYearId = signal<number | ''>('');
  protected readonly selectedLessonId = signal<number | ''>('');
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<'all' | 'active' | 'used'>('all');

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

  public ngOnInit() {
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

  protected onAcademicYearChange() {
    this.selectedLessonId.set('');
  }
}
