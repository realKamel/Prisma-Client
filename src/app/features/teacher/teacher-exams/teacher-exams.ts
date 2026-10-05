import { Component } from '@angular/core';
import { QuizScope } from '../../../core/enums/quiz-scope';
import { QuizzesPanelComponent } from './quizzes-panel/quizzes-panel';

/**
 * First page of the `/dashboard/grading` section (comprehensive exams).
 *
 * The section is no longer a routed parent: each tab is its own sibling route
 * reached from the sidebar's `grading` children, and this component only keeps
 * the first tab.
 */
@Component({
  selector: 'app-teacher-exams',
  imports: [QuizzesPanelComponent],
  templateUrl: './teacher-exams.html',
  host: { class: 'block' },
})
export class TeacherExamsComponent {
  protected readonly QuizScope = QuizScope;
}
