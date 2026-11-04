import { Service, inject, signal } from '@angular/core';
import { AcademicYear, Lesson } from '../../models/teacher-exams-model';
import { TeacherExamsService } from '../../services/teacher-exams.service';

/**
 * Lookups shared by the grading tabs (quizzes + assignments).
 *
 * Root-scoped, so the lesson / academic-year lists are fetched once and reused
 * while the user moves between the child routes of `/dashboard/grading`.
 */
@Service()
export class TeacherExamsStore {
  private readonly svc = inject(TeacherExamsService);

  private readonly quizlessonsState = signal<Lesson[]>([]);
  private readonly assignmentlessonsState = signal<Lesson[]>([]);
  private readonly academicYearsState = signal<AcademicYear[]>([]);

  public readonly quizLessons = this.quizlessonsState.asReadonly();
  public readonly assignmentLessons = this.assignmentlessonsState.asReadonly();
  
  public readonly academicYears = this.academicYearsState.asReadonly();

  /** Fetches the shared lookups once; later calls are no-ops. */
  public loadLookupsQuiz(): void {
    this.svc.getQuizLessons().subscribe({ next: (lessons) => this.quizlessonsState.set(lessons) });
    this.svc.getAcademicYears().subscribe({ next: (years) => this.academicYearsState.set(years), });
  }
  public loadLookupsAssignment(): void {
    this.svc.getAssignmentLessons().subscribe({ next: (lessons) => this.assignmentlessonsState.set(lessons) });
  }
}
