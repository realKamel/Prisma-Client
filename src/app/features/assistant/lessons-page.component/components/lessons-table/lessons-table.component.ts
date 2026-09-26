import { DecimalPipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { bootstrapPencil, bootstrapTrash3 } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AssistantLessonDto } from '../../../../../core/Models/Assistant/assistant-lesson.model';
import { LessonEmptyStateComponent } from '../lesson-empty-state/lesson-empty-state.component';
import { LessonStatusBadgeComponent } from '../lesson-status-badge/lesson-status-badge.component';

@Component({
  selector: 'app-lessons-table',
  imports: [
    LessonStatusBadgeComponent,
    LessonEmptyStateComponent,
    RouterModule,
    RouterLink,
    DecimalPipe,
    NgIcon,
  ],
  templateUrl: './lessons-table.component.html',
  viewProviders: [
    provideIcons({
      bootstrapPencil,
      bootstrapTrash3,
    }),
  ],
  providers: [DecimalPipe],
})
export class LessonsTableComponent {
  public readonly lessons = input.required<AssistantLessonDto[]>();
  private readonly numberPipe = inject(DecimalPipe);
  public readonly hasQuery = input(false);

  public edit = output<number>();
  public toggleStatus = output<AssistantLessonDto>();
  public requestDelete = output<AssistantLessonDto>();
  public addLesson = output<void>();

  // TODO: swap for the shared ArDatePipe once wired into this feature —
  // this is a minimal stand-in that mirrors the same relative-time copy.
  public formatRelative(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60)
      return minutes === 1 ? 'منذ دقيقة' : `منذ ${this.numberPipe.transform(minutes)} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
      return hours === 1 ? 'منذ ساعة' : `منذ ${this.numberPipe.transform(hours)} ساعة`;
    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? 'منذ يوم' : `منذ ${this.numberPipe.transform(days)} أيام`;
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? 'منذ أسبوع' : `منذ ${this.numberPipe.transform(weeks)} أسابيع`;
  }
}
