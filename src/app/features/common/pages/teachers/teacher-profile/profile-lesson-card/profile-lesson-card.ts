import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  bootstrapArrowLeft,
  bootstrapBookFill,
  bootstrapClockFill,
  bootstrapCollectionPlayFill,
  bootstrapPeopleFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ProfileLesson } from '../../../../../student/models/teacher-profile.model';

/**
 * Lesson card for the public teacher profile. The page is public and cached for every visitor,
 * so there is no enrollment status: the whole card links to the lesson details page.
 */
@Component({
  selector: 'app-profile-lesson-card',
  imports: [RouterModule, NgIcon, CurrencyPipe],
  templateUrl: './profile-lesson-card.html',
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
      bootstrapBookFill,
      bootstrapClockFill,
      bootstrapCollectionPlayFill,
      bootstrapPeopleFill,
    }),
  ],
})
export class ProfileLessonCardComponent {
  public readonly lesson = input.required<ProfileLesson>();
  /** Teacher gradient, used as the cover when the lesson has no (or a broken) thumbnail. */
  public readonly gradient = input('');

  protected readonly imageError = signal(false);

  protected readonly isFree = computed(() => (this.lesson().money?.amount ?? 0) <= 0);

  protected readonly durationLabel = computed(() => {
    const total = this.lesson().duration?.seconds ?? 0;
    if (total <= 0) return '';

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} ساعة`);
    if (minutes > 0) parts.push(`${minutes} دقيقة`);

    return parts.length > 0 ? parts.join(' و ') : 'أقل من دقيقة';
  });
}