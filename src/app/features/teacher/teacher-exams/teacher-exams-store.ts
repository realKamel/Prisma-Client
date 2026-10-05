import { Service, inject, signal } from '@angular/core';
import { AcademicYear, Lesson } from '../../../core/Models/Teacher/teacher-exams-model';
import { TeacherExamsService } from '../../../core/Services/teacher-exams-service';

/**
 * Lookups shared by the grading tabs (quizzes + assignments).
 *
 * Root-scoped, so the lesson / academic-year lists are fetched once and reused
 * while the user moves between the child routes of `/dashboard/grading`.
 */
@Service()
export class TeacherExamsStore {
  private readonly svc = inject(TeacherExamsService);

  private readonly lessonsState = signal<Lesson[]>([]);
  private readonly academicYearsState = signal<AcademicYear[]>([]);

  private lookupsRequested = false;

  public readonly lessons = this.lessonsState.asReadonly();
  public readonly academicYears = this.academicYearsState.asReadonly();

  /** Fetches the shared lookups once; later calls are no-ops. */
  public loadLookups(): void {
    if (this.lookupsRequested) return;
    this.lookupsRequested = true;

    this.svc.getLessons().subscribe({ next: (lessons) => this.lessonsState.set(lessons) });
    this.svc.getAcademicYears().subscribe({
      next: (years) => this.academicYearsState.set(years),
    });
  }
}
