import { DatePipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { bootstrapArrowLeft } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DurationPipe } from '../../../../../../shared/pipes/duration/duration-pipe';
import { LessonCardDto, LessonStatus } from '../../../../models/dashboard.models';
import { ImagePlaceholderDirective } from '../../../../../../shared/directives/Image-placeholder/image-placeholder.directive';

@Component({
  selector: 'app-lesson-card',
  imports: [NgIcon, DurationPipe, DatePipe, ImagePlaceholderDirective, TranslatePipe],
  templateUrl: './lesson-card.html',
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
    }),
  ],
})
export class LessonCardComponent {
  public readonly lesson = input.required<LessonCardDto>();
  public readonly ctaClick = output<string>();
  protected readonly imageError = signal(false);

  /**
   * A real Date, or null when the DTO has no usable end date.
   * DatePipe throws on an unparseable string, and reading `.endDate` of a missing
   * validityDateRange throws too. Either error aborts the template render, so the
   * check lives here instead of in the template.
   */
  protected readonly expiryDate = computed<Date | null>(() => {
    const raw = this.lesson().validityDateRange?.endDate;
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  });

  protected onCtaClick(): void {
    this.ctaClick.emit(this.lesson().lessonPublicId);
  }

  // These return translation keys; the template runs them through the translate pipe
  protected get ctaKey(): string {
    const map: Record<LessonStatus, string> = {
      new: 'DASHBOARD.LESSON_CARD.CTA.NEW',
      progress: 'DASHBOARD.LESSON_CARD.CTA.PROGRESS',
      done: 'DASHBOARD.LESSON_CARD.CTA.DONE',
      warn: 'DASHBOARD.LESSON_CARD.CTA.WARN',
      expired: 'DASHBOARD.LESSON_CARD.CTA.EXPIRED',
    };
    return map[this.lesson().status];
  }

  protected get statusKey(): string {
    const map: Record<LessonStatus, string> = {
      new: 'DASHBOARD.LESSON_CARD.STATUS.NEW',
      progress: 'DASHBOARD.LESSON_CARD.STATUS.PROGRESS',
      done: 'DASHBOARD.LESSON_CARD.STATUS.DONE',
      warn: 'DASHBOARD.LESSON_CARD.STATUS.WARN', // uses {{days}}
      expired: 'DASHBOARD.LESSON_CARD.STATUS.EXPIRED',
    };
    return map[this.lesson().status];
  }

  protected get expiryKey(): string {
    return this.lesson().status === 'expired'
      ? 'DASHBOARD.LESSON_CARD.EXPIRED_ON'
      : 'DASHBOARD.LESSON_CARD.EXPIRES_ON';
  }

  protected get statusPillClass(): Record<string, boolean> {
    return {
      'bg-[color-mix(in_srgb,var(--color-mint)_42%,black)]': this.lesson().status === 'new',
      'bg-[color-mix(in_srgb,var(--color-muted)_42%,black)]': this.lesson().status === 'done',
      'bg-[color-mix(in_srgb,var(--color-star)_42%,black)]': this.lesson().status === 'warn',
      'bg-[color-mix(in_srgb,var(--color-coral)_42%,black)]': this.lesson().status === 'expired',
      'bg-[color-mix(in_srgb,var(--color-primary)_42%,black)]': this.lesson().status === 'progress',
    };
  }
}