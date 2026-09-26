import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  bootstrapEye,
  bootstrapEyeSlash,
  bootstrapJournalX,
  bootstrapPencil,
  bootstrapTrash3,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { TeacherLesson } from '../../../../../core/Models/Teacher/Teacherlesson.model';

@Component({
  selector: 'app-lessons-table',
  imports: [RouterModule, DecimalPipe, NgIcon, NgmMotionDirective, CurrencyPipe],
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
  public readonly lessons = input<TeacherLesson[]>([]);
  public readonly toggleStatus = output<number>();
  public readonly deleteLesson = output<TeacherLesson>();

  protected readonly statusLabels: Record<string, string> = {
    active: 'نشط',
    hidden: 'مخفي',
    drafted: 'مسودة',
  };

  protected readonly statusDotColor: Record<string, string> = {
    active: 'bg-mint',
    hidden: 'bg-muted',
    drafted: 'bg-star',
  };

  protected readonly statusTextColor: Record<string, string> = {
    active: 'text-mint',
    hidden: 'text-muted',
    drafted: 'text-star',
  };

  protected readonly statusBg: Record<string, string> = {
    active: 'bg-[rgba(78,203,141,.14)]  border-[rgba(78,203,141,.28)]',
    hidden: 'bg-[rgba(145,144,168,.12)] border-[rgba(145,144,168,.24)]',
    drafted: 'bg-[rgba(247,201,72,.12)]  border-[rgba(247,201,72,.28)]',
  };

  protected toggleLabel(lesson: TeacherLesson): string {
    return lesson.status === 'hidden' ? 'إظهار' : 'إخفاء';
  }

  protected toggleIcon(lesson: TeacherLesson): string {
    return lesson.status === 'hidden' ? 'bootstrapEye' : 'bootstrapEyeSlash';
  }
}
