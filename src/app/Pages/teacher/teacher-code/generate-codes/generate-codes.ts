import { Component, signal, computed, OnInit, inject } from '@angular/core';

import { RouterLink, ActivatedRoute } from '@angular/router';
import { CodesService } from '../../../../core/Services/codes.service';
import type { AcademicYear, Lesson } from '../../../../core/Models/Teacher/teacher-codes.module';

@Component({
  selector: 'app-generate-codes',
  imports: [RouterLink],
  templateUrl: './generate-codes.html',
})
export class GenerateCodesComponent implements OnInit {
  private codesService = inject(CodesService);
  private route = inject(ActivatedRoute);

  // ── Raw data ──
  academicYears = signal<AcademicYear[]>([]);
  lessons = signal<Lesson[]>([]);
  error = signal(false);

  // ── Form state ──
  selectedAcademicYearId = signal<number | ''>('');
  selectedLessonId = signal<number | ''>('');
  count = signal(10);
  prefix = signal('');

  // ── UI state ──
  showSuccess = signal(false);
  generatedCodes = signal<string[]>([]);
  submitting = signal(false);

  // ── Validation errors ──
  lessonError = signal(false);
  countError = signal(false);
  prefixError = signal(false);

  // ── Derived: lessons filtered by academic year, deduplicated ──
  availableLessons = computed(() => {
    const ayId = this.selectedAcademicYearId();
    if (ayId === '') return [];

    const seen = new Set<number>();
    return this.lessons()
      .filter((l) => l.academicYearId === Number(ayId))
      .filter((l) => {
        if (seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
      });
  });

  // ── Derived: selected lesson name ──
  selectedLessonName = computed(() => {
    const lessonId = this.selectedLessonId();
    if (lessonId === '') return '';
    const lesson = this.lessons().find((l) => l.id === Number(lessonId));
    return lesson ? lesson.name : '';
  });

  ngOnInit() {
    this.loadAcademicYears();
    this.loadLessons();

    this.route.queryParams.subscribe((params) => {
      if (params['academicYearId']) {
        this.selectedAcademicYearId.set(Number(params['academicYearId']));
      }
      if (params['lessonId']) {
        this.selectedLessonId.set(Number(params['lessonId']));
      }
    });
  }

  onAcademicYearChange() {
    this.selectedLessonId.set('');
  }

  // ── Number controls ──
  increment() {
    const v = this.count();
    if (v < 100) this.count.set(v + 1);
  }

  decrement() {
    const v = this.count();
    if (v > 1) this.count.set(v - 1);
  }

  onCountBlur() {
    let v = this.count();
    if (isNaN(v) || v < 1) v = 1;
    if (v > 100) v = 100;
    this.count.set(v);
  }

  // ── Validation ──
  validate(): boolean {
    let valid = true;

    if (this.selectedLessonId() === '') {
      this.lessonError.set(true);
      valid = false;
    } else {
      this.lessonError.set(false);
    }

    const c = this.count();
    if (isNaN(c) || c < 1 || c > 100) {
      this.countError.set(true);
      valid = false;
    } else {
      this.countError.set(false);
    }

    const p = this.prefix().trim();
    if (p && !/^[A-Za-z]{3,6}$/.test(p)) {
      this.prefixError.set(true);
      valid = false;
    } else {
      this.prefixError.set(false);
    }

    return valid;
  }

  clearErrors() {
    this.lessonError.set(false);
    this.countError.set(false);
    this.prefixError.set(false);
  }

  // ── Submit ──
  submit() {
    if (!this.validate()) return;

    this.submitting.set(true);

    const payload = {
      academicYearId: Number(this.selectedAcademicYearId()),
      lessonId: Number(this.selectedLessonId()),
      count: this.count(),
      prefix: this.prefix().trim().toUpperCase() || undefined,
    };

    this.codesService.createBatch(payload).subscribe((res) => {
      this.generatedCodes.set(res.data.codes);
      if (res.fromFallback) this.error.set(true);
      this.submitting.set(false);
      this.showSuccess.set(true);
    });
  }

  reset() {
    this.selectedLessonId.set('');
    this.count.set(10);
    this.prefix.set('');
    this.showSuccess.set(false);
    this.generatedCodes.set([]);
    this.clearErrors();
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
  }

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
}
