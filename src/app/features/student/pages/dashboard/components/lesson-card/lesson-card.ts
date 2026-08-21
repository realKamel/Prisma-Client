import { Component, input, output } from '@angular/core';
import {
  LessonCardDto,
  LessonStatus,
} from '../../../../../../core/Models/Student/Dashboard.Models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowLeft } from '@ng-icons/bootstrap-icons';
// import { LessonCardComponent } from '../../../lessons/lesson-card/lesson-card';

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
  readonly lesson = input.required<LessonCardDto>();
  readonly ctaClick = output<string>();

  onCtaClick(): void {
    this.ctaClick.emit(this.lesson().id);
  }

  get ctaLabel(): string {
    const map: Record<LessonStatus, string> = {
      new: 'ابدأ',
      progress: 'كمل',
      done: 'راجع',
      warn: 'كمل بسرعة',
      expired: 'جدد الاشتراك',
    };
    return map[this.lesson().status];
  }

  get statusLabel(): string {
    const map: Record<LessonStatus, string> = {
      new: 'ما اتفتحش',
      progress: 'في التقدم',
      done: 'مكتمل',
      warn: `يخلص بعد ${this.lesson().expiresInDays ?? '?'} أيام`,
      expired: 'منتهي الصلاحية',
    };
    return map[this.lesson().status];
  }

  get statusPillClass(): Record<string, boolean> {
    return {
      'bg-[rgba(78,203,141,0.18)] border-[rgba(78,203,141,0.35)]': this.lesson().status === 'new',
      'bg-[rgba(191,192,209,0.16)] border-[rgba(191,192,209,0.3)]': this.lesson().status === 'done',
      'bg-[rgba(247,201,72,0.18)] border-[rgba(247,201,72,0.35)]': this.lesson().status === 'warn',
      'bg-[rgba(240,106,106,0.18)] border-[rgba(240,106,106,0.35)]':
        this.lesson().status === 'expired',
    };
  }

  get statusDotClass(): Record<string, boolean> {
    return {
      'bg-mint': this.lesson().status === 'new',
      'bg-ink-subtle': this.lesson().status === 'done',
      'bg-star': this.lesson().status === 'warn',
      'bg-coral': this.lesson().status === 'expired',
    };
  }

  /**
   * Progress pill colors applied as INLINE styles — guaranteed to render in both
   * themes, no reliance on Tailwind class generation or color-mix().
   */
  get statusPillStyle(): Record<string, string> | null {
    if (this.lesson().status !== 'progress') return null;
    return {
      'background-color': 'rgba(var(--accent-rgb), 0.22)',
      color: '#fff',
      'border-color': 'rgba(var(--accent-rgb), 0.4)',
    };
  }

  get statusDotStyle(): Record<string, string> | null {
    if (this.lesson().status !== 'progress') return null;
    return { 'background-color': 'var(--color-primary-light)' };
  }
}
