import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { CurrencyPipe, DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  bootstrapEye,
  bootstrapEyeSlash,
  bootstrapExclamationTriangle,
  bootstrapImage,
  bootstrapJournalX,
  bootstrapPencil,
  bootstrapThreeDotsVertical,
  bootstrapTrash3,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { TeacherLesson } from '../../../../models/Teacherlesson.model';

@Component({
  selector: 'app-lessons-table',
  standalone: true,
  imports: [
    RouterModule,
    DecimalPipe,
    CurrencyPipe,
    DatePipe,
    NgTemplateOutlet,
    NgIcon,
    NgmMotionDirective,
    TranslatePipe,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
  ],
  templateUrl: './lessons-table-component.html',
  viewProviders: [
    provideIcons({
      bootstrapJournalX,
      bootstrapPencil,
      bootstrapEye,
      bootstrapEyeSlash,
      bootstrapExclamationTriangle,
      bootstrapTrash3,
      bootstrapImage,
      bootstrapThreeDotsVertical,
    }),
  ],
})
export class LessonsTableComponent {
  public readonly lessons = input<TeacherLesson[]>([]);
  /** True while a request is in flight: dims the list, shows skeletons if there's nothing yet. */
  public readonly loading = input(false);
  /** True when a search or status filter is active, so the empty state can say so. */
  public readonly isFiltered = input(false);
  /** True when the last request failed: shows an error state and a retry button. */
  public readonly error = input(false);

  public readonly toggleStatus = output<number>();
  public readonly deleteLesson = output<TeacherLesson>();
  public readonly retry = output<void>();

  // Thumbnail URLs that failed to load. Keyed by URL (not lesson id), so a fresh link is tried again.
  private readonly brokenImages = signal<ReadonlySet<string>>(new Set());

  protected showThumb(lesson: TeacherLesson): boolean {
    return !!lesson.thumbnailUrl && !this.brokenImages().has(lesson.thumbnailUrl);
  }

  protected onImageError(url: string | null): void {
    if (!url) return;
    this.brokenImages.update((set) => new Set(set).add(url));
  }

  protected readonly statusLabelKeys: Record<string, string> = {
    active: 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.STATUS.ACTIVE',
    hidden: 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.STATUS.HIDDEN',
    drafted: 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.STATUS.DRAFTED',
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

  protected toggleLabelKey(lesson: TeacherLesson): string {
    return lesson.status === 'hidden'
      ? 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.ACTIONS.SHOW'
      : 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.ACTIONS.HIDE';
  }

  protected toggleIcon(lesson: TeacherLesson): string {
    return lesson.status === 'hidden' ? 'bootstrapEye' : 'bootstrapEyeSlash';
  }

  protected sectionsLabelKey(count: number): string {
    if (count === 0) return 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.META.SECTIONS_NONE';
    if (count === 1) return 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.META.SECTIONS_ONE';
    if (count === 2) return 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.META.SECTIONS_TWO';
    if (count <= 10) return 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.META.SECTIONS_FEW';
    return 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.META.SECTIONS_MANY';
  }

  protected durationLabelKey(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0 && minutes === 0) {
      return 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.META.DURATION_UNDER_MINUTE';
    }
    if (hours === 0) {
      return 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.META.DURATION_MINUTES';
    }
    return minutes === 0
      ? 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.META.DURATION_HOURS'
      : 'TEACHER_LESSONS_PAGE.LESSONS_TABLE.META.DURATION_HOURS_MINUTES';
  }

  protected durationParams(seconds: number): { hours: number; minutes: number } {
    return {
      hours: Math.floor(seconds / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
    };
  }
}
