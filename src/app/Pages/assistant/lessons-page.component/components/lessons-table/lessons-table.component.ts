import { Component, input, output } from '@angular/core';
import { LessonStatusBadgeComponent } from '../lesson-status-badge/lesson-status-badge.component';
import { LessonEmptyStateComponent } from '../lesson-empty-state/lesson-empty-state.component';
import { AssistantLessonDto } from '../../../../../core/Models/Assistant/assistant-lesson.model';

@Component({
  selector: 'app-lessons-table',
  standalone: true,
  imports: [LessonStatusBadgeComponent, LessonEmptyStateComponent],
  templateUrl: './lessons-table.component.html',
})
export class LessonsTableComponent {
  lessons = input.required<AssistantLessonDto[]>();
  hasQuery = input(false);

  edit = output<number>();
  toggleStatus = output<AssistantLessonDto>();
  requestDelete = output<AssistantLessonDto>();
  addLesson = output<void>();

  // TODO: swap for the shared ArNumberPipe / toAr() util once wired into this feature.
  toAr(value: number): string {
    return String(value).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  // TODO: swap for the shared ArDatePipe once wired into this feature —
  // this is a minimal stand-in that mirrors the same relative-time copy.
  formatRelative(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return minutes === 1 ? 'منذ دقيقة' : `منذ ${this.toAr(minutes)} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? 'منذ ساعة' : `منذ ${this.toAr(hours)} ساعة`;
    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? 'منذ يوم' : `منذ ${this.toAr(days)} أيام`;
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? 'منذ أسبوع' : `منذ ${this.toAr(weeks)} أسابيع`;
  }
}
