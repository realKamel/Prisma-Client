import { Component, computed, inject, input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Lesson } from '../../../../../core/Models/lesson-model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-lesson-card',
  imports: [RouterModule],
  templateUrl: './lesson-card.html',
  styleUrls: ['./lesson-card.css'],
  providers: [DecimalPipe],
})
export class LessonCardComponent {
  private router = inject(Router);
  private readonly numberPipe = inject(DecimalPipe);
  public lesson = input.required<Lesson>();

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

  navigateToLesson(): void {
    switch (this.lesson()?.status) {
      case 'avail':
        this.router.navigate(['/lessons', this.lesson().id, 'details']);
        break;
      case 'expired':
        this.router.navigate(['/lessons', this.lesson().id, 'expired']);
        break;
      case 'purchased':
        this.router.navigate(['/lessons', this.lesson().id, 'watch']);
        break;
      case 'locked':
        break;
    }
  }

  readonly statusLabel = computed(() => this.STATUS_LABELS[this.lesson().status] ?? '');

  readonly ctaLabel = computed(() => this.CTA_LABELS[this.lesson().status] ?? '');

  readonly durationDisplay = computed(() => {
    const h = this.lesson().durationHours;
    return this.numberPipe.transform(String(h)) + ' ساعة';
  });

  readonly showPrice = computed(() => {
    const lesson = this.lesson();
    return (
      lesson.status === 'avail' &&
      lesson.price !== null &&
      lesson.price !== undefined &&
      lesson.price! > 0
    );
  });
}
