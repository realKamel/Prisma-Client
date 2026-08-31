import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TeacherLesson } from '../../../../../core/Models/Teacher/Teacherlesson.model';
import { DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapJournalX,
  bootstrapPencil,
  bootstrapEye,
  bootstrapEyeSlash,
  bootstrapTrash3,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-lessons-table',
  imports: [RouterModule, DecimalPipe, NgIcon],
  templateUrl: './lessons-table-component.html',
  viewProviders: [
    provideIcons({
      bootstrapJournalX,
      bootstrapPencil,
      bootstrapEye,
      bootstrapEyeSlash,
      bootstrapTrash3,
    }),
  ],
})
export class LessonsTableComponent {
  readonly lessons = input<TeacherLesson[]>([]);
  readonly toggleStatus = output<number>();
  readonly deleteLesson = output<TeacherLesson>();

  readonly statusLabels: Record<string, string> = {
    active: 'نشط',
    hidden: 'مخفي',
    drafted: 'مسودة',
  };

  readonly statusDotColor: Record<string, string> = {
    active: 'bg-mint',
    hidden: 'bg-muted',
    drafted: 'bg-star',
  };

  readonly statusTextColor: Record<string, string> = {
    active: 'text-mint',
    hidden: 'text-muted',
    drafted: 'text-star',
  };

  readonly statusBg: Record<string, string> = {
    active: 'bg-[rgba(78,203,141,.14)]  border-[rgba(78,203,141,.28)]',
    hidden: 'bg-[rgba(145,144,168,.12)] border-[rgba(145,144,168,.24)]',
    drafted: 'bg-[rgba(247,201,72,.12)]  border-[rgba(247,201,72,.28)]',
  };

  toggleLabel(lesson: TeacherLesson): string {
    return lesson.status === 'hidden' ? 'إظهار' : 'إخفاء';
  }

  toggleIcon(lesson: TeacherLesson): string {
    return lesson.status === 'hidden' ? 'bootstrapEye' : 'bootstrapEyeSlash';
  }
}
