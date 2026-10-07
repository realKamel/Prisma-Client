import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { Lesson } from '../../../../../core/Models/lesson-model';

@Component({
  selector: 'app-lesson-card',
  imports: [RouterModule, NgmMotionDirective, CurrencyPipe],
  templateUrl: './lesson-card.html',
  styleUrls: ['./lesson-card.css'],
  providers: [DecimalPipe],
})
export class LessonCardComponent {
  private router = inject(Router);
  private readonly numberPipe = inject(DecimalPipe);
  public readonly lesson = input.required<Lesson>();

  public readonly animationDelay = input(0);

  private readonly STATUS_LABELS: Record<Lesson['status'], string> = {
    avail: 'متاح',
    purchased: 'مشتري',
    locked: 'مقفول',
    expired: 'منتهي الصلاحية',
  };

  private readonly CTA_LABELS: Record<Lesson['status'], string> = {
    avail: 'اشتري',
    purchased: 'ادخل الدرس',
    locked: '',
    expired: 'جدد',
  };

  protected navigateToLesson(): void {
    switch (this.lesson()?.status) {
      case 'avail':
        void this.router.navigate(['/lessons', this.lesson().id, 'details']);
        break;
      case 'expired':
        void this.router.navigate(['/lessons', this.lesson().id, 'expired']);
        break;
      case 'purchased':
        void this.router.navigate(['/lessons', this.lesson().id, 'watch']);
        break;
      case 'locked':
        break;
    }
  }

  protected readonly statusLabel = computed(() => this.STATUS_LABELS[this.lesson().status] ?? '');

  protected readonly ctaLabel = computed(() => this.CTA_LABELS[this.lesson().status] ?? '');

  protected readonly durationDisplay = computed(() => {
    const total = this.lesson().durationMinutes ?? 0;
    if (total <= 0) return '';

    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${this.numberPipe.transform(String(hours))} ساعة`);
    if (minutes > 0) parts.push(`${this.numberPipe.transform(String(minutes))} دقيقة`);

    return parts.join(' و ');
  });

  protected readonly showPrice = computed(() => {
    const lesson = this.lesson();
    return (
      lesson.status === 'avail' &&
      lesson.price !== null &&
      lesson.price !== undefined &&
      lesson.price! > 0
    );
  });
}
