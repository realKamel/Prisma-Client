// dashboard/components/lesson-card/lesson-card.component.ts
import { Component, Input, Output, EventEmitter, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LessonCardDto, LessonStatus } from '../../../../../core/Models/Student/Dashboard.Models';

@Component({
  selector: 'app-lesson-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-card.html',
})
export class LessonCard {
  @Input({ required: true }) lesson!: LessonCardDto;
  @Output() ctaClick = new EventEmitter<string>();

  onCtaClick(): void {
    this.ctaClick.emit(this.lesson.id);
  }

  get ctaLabel(): string {
    const map: Record<LessonStatus, string> = {
      new: 'ابدأ',
      progress: 'كمل',
      done: 'راجع',
      warn: 'كمل بسرعة',
      expired: 'جدد الاشتراك',
    };
    return map[this.lesson.status];
  }

  get statusLabel(): string {
    const map: Record<LessonStatus, string> = {
      new: 'ما اتفتحش',
      progress: 'في التقدم',
      done: 'مكتمل',
      warn: `يخلص بعد ${this.lesson.expiresInDays ?? '?'} أيام`,
      expired: 'منتهي الصلاحية',
    };
    return map[this.lesson.status];
  }

  get statusPillClass(): Record<string, boolean> {
    return {
      'bg-[rgba(78,203,141,0.18)] text-[var(--mint)] border-[rgba(78,203,141,0.35)]':
        this.lesson.status === 'new',
      'bg-[rgba(var(--accent-rgb),0.2)] text-[var(--purple-lt)] border-[rgba(var(--accent-rgb),0.35)]':
        this.lesson.status === 'progress',
      'bg-[rgba(191,192,209,0.16)] text-[var(--lavender)] border-[rgba(191,192,209,0.3)]':
        this.lesson.status === 'done',
      'bg-[rgba(247,201,72,0.18)] text-[var(--star)] border-[rgba(247,201,72,0.35)]':
        this.lesson.status === 'warn',
      'bg-[rgba(240,106,106,0.18)] text-[var(--coral)] border-[rgba(240,106,106,0.35)]':
        this.lesson.status === 'expired',
    };
  }

  get statusDotClass(): Record<string, boolean> {
    return {
      'bg-[var(--mint)]': this.lesson.status === 'new',
      'bg-[var(--purple-lt)] animate-pulse': this.lesson.status === 'progress',
      'bg-[var(--lavender)]': this.lesson.status === 'done',
      'bg-[var(--star)]': this.lesson.status === 'warn',
      'bg-[var(--coral)]': this.lesson.status === 'expired',
    };
  }
}