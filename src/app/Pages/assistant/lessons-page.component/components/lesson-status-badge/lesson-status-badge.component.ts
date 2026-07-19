import { Component, computed, input } from '@angular/core';
import { LessonStatus } from '../../../../../core/Models/Teacher/Teacherlesson.model';

@Component({
  selector: 'app-lesson-status-badge',

  templateUrl: './lesson-status-badge.component.html',
})
export class LessonStatusBadgeComponent {
  status = input.required<LessonStatus>();

  readonly label = computed(() => {
    switch (this.status()) {
      case 'active':
        return 'منشورة';
      case 'drafted':
        return 'مسودة';
      case 'hidden':
        return 'مخفية';
    }
  });

  // Same rgba values as the original .status-badge / .published / .draft
  // CSS — 'hidden' reuses the base (un-suffixed) purple-lt style.
  readonly colorClasses = computed(() => {
    switch (this.status()) {
      case 'active':
        return 'bg-[rgba(78,203,141,0.14)] text-[var(--mint)]';
      case 'drafted':
        return 'bg-[rgba(247,201,72,0.14)] text-[var(--star)]';
      case 'hidden':
        return 'bg-[rgba(160,144,208,0.14)] text-[var(--purple-lt)]';
    }
  });
}
