import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorClockBold } from '@ng-icons/phosphor-icons/bold';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { Lesson } from '../../../../../core/Models/lesson-model';
import { DurationPipe } from '../../../../../core/pipes/duration-pipe/duration-pipe';

@Component({
  selector: 'app-lesson-card',
  imports: [RouterModule, NgmMotionDirective, NgIcon, CurrencyPipe, DatePipe, DurationPipe],
  templateUrl: './lesson-card.html',
  styleUrls: ['./lesson-card.css'],
  providers: [DecimalPipe],
  viewProviders: [provideIcons({ phosphorClockBold })],
})
export class LessonCardComponent {
  private router = inject(Router);
  private readonly numberPipe = inject(DecimalPipe);
  public readonly lesson = input.required<Lesson>();
  protected readonly imageError = signal(false);

  public readonly animationDelay = input(0);

  private readonly STATUS_LABELS: Record<Lesson['status'], string> = {
    available: 'متاح',
    active: 'نشط',
    locked: 'مقفول',
    expired: 'منتهي الصلاحية',
    done: 'مكتمل',
    suspended: 'معلق',
  };

  private readonly CTA_LABELS: Record<Lesson['status'], string> = {
    available: 'اشتري',
    active: 'ادخل الدرس',
    locked: 'مغلق',
    expired: 'جدد',
    done: 'مكتمل',
    suspended: 'معلق',
  };

  protected navigateToLesson(): void {
    switch (this.lesson()?.status) {
      case 'available':
        void this.router.navigate(['/lessons', this.lesson().id, 'details']);
        break;
      case 'expired':
        void this.router.navigate(['/lessons', this.lesson().id, 'expired']);
        break;
      case 'active':
        void this.router.navigate(['/lessons', this.lesson().id, 'watch']);
        break;
      case 'locked':
        break;
    }
  }

  protected readonly statusLabel = computed(() => this.STATUS_LABELS[this.lesson().status] ?? '');

  protected readonly ctaLabel = computed(() => this.CTA_LABELS[this.lesson().status] ?? '');

  // protected readonly durationDisplay = computed(() => {
  //   const total = this.lesson().duration.seconds ?? 0;
  //   if (total <= 0) return '';

  //   const hours = Math.floor(total / 60);
  //   const minutes = total % 60;

  //   const parts: string[] = [];
  //   if (hours > 0) parts.push(`${this.numberPipe.transform(String(hours))} ساعة`);
  //   if (minutes > 0) parts.push(`${this.numberPipe.transform(String(minutes))} دقيقة`);

  //   return parts.join(' و ');
  // });

  protected readonly showPrice = computed(() => {
    const lesson = this.lesson();
    return (
      lesson.status === 'available' &&
      lesson.money !== null &&
      lesson.money !== undefined &&
      lesson.money.amount > 0
    );
  });
}
