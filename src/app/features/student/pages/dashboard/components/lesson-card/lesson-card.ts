import { Component, input, output, signal } from '@angular/core';
import { bootstrapArrowLeft } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  LessonCardDto,
  LessonStatus,
} from '../../../../../../core/Models/Student/Dashboard.Models';

@Component({
  selector: 'app-lesson-card',
  imports: [NgIcon],
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

  protected onCtaClick(): void {
    this.ctaClick.emit(this.lesson().id);
  }

  protected get ctaLabel(): string {
    const map: Record<LessonStatus, string> = {
      new: 'ابدأ',
      progress: 'كمل',
      done: 'راجع',
      warn: 'كمل بسرعة',
      expired: 'جدد الاشتراك',
    };
    return map[this.lesson().status];
  }

  protected get statusLabel(): string {
    const map: Record<LessonStatus, string> = {
      new: 'ما اتفتحش',
      progress: 'في التقدم',
      done: 'مكتمل',
      warn: `يخلص بعد ${this.lesson().expiresInDays ?? '?'} أيام`,
      expired: 'منتهي الصلاحية',
    };
    return map[this.lesson().status];
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
