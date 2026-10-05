import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
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
  standalone: true,
  imports: [
    RouterModule,
    DecimalPipe,
    CurrencyPipe,
    NgIcon,
    NgmMotionDirective,
    CdkTableModule,
    ScrollingModule,
  ],
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

  protected readonly rowHeight = 52;
  protected readonly headerHeight = 44;
  protected readonly maxViewportHeight = 500;

  /**
   * The viewport must be its own scroll container with a definite pixel height.
   * Hug the content while it fits, then cap at `maxViewportHeight` so longer
   * lists scroll instead of growing the page.
   */
  protected readonly viewportHeight = computed(() =>
    Math.min(this.lessons().length * this.rowHeight + this.headerHeight, this.maxViewportHeight),
  );

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
    active: 'bg-[rgba(78,203,141,.14)] border-[rgba(78,203,141,.28)]',
    hidden: 'bg-[rgba(145,144,168,.12)] border-[rgba(145,144,168,.24)]',
    drafted: 'bg-[rgba(247,201,72,.12)] border-[rgba(247,201,72,.28)]',
  };

  protected toggleLabel(lesson: TeacherLesson): string {
    return lesson.status === 'hidden' ? 'إظهار' : 'إخفاء';
  }

  protected toggleIcon(lesson: TeacherLesson): string {
    return lesson.status === 'hidden' ? 'bootstrapEye' : 'bootstrapEyeSlash';
  }

  public readonly displayedColumns: string[] = ['name', 'price', 'students', 'status', 'actions'];
}
