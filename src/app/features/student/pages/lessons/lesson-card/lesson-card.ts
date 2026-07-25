import { Component, Input, inject, input } from '@angular/core';
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
  // @Input({ required: true }) lesson!: Lesson;
  public lesson = input.required<Lesson>();

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

  get statusLabel(): string {
    const map: Record<string, string> = {
      avail: 'متاح',
      purchased: 'مشتري',
      locked: 'مقفول',
      expired: 'منتهي الصلاحية',
    };
    return map[this.lesson().status] ?? '';
  }

  get ctaLabel(): string {
    const map: Record<string, string> = {
      avail: 'اشتري',
      purchased: 'ادخل الدرس',
      locked: '',
      expired: 'جدد',
    };
    return map[this.lesson().status] ?? '';
  }

  get durationDisplay(): string {
    const h = this.lesson().durationHours;
    return this.numberPipe.transform(String(h)) + ' ساعة';
  }
  get showPrice(): boolean {
    return (
      this.lesson().status === 'avail' &&
      this.lesson().price !== null &&
      this.lesson().price !== undefined &&
      this.lesson()?.price! > 0
    );
  }
}
