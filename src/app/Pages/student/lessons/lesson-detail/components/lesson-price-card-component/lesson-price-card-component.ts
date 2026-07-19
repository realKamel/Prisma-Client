import { Component, output, input } from '@angular/core';
import { LessonResponse } from '../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-price-card',

  templateUrl: './lesson-price-card-component.html',
})
export class LessonPriceCardComponent {
  readonly lesson = input.required<LessonResponse>();

  // إضافة Output لإبلاغ الصفحة الأب
  readonly buyClick = output<void>();
  readonly RedeemCode = output<void>();

  public onBuyLesson(): void {
    // بدلاً من تنفيذ المنطق هنا، نرسل إشارة للأب
    this.buyClick.emit();
  }

  public onEnterPromoCode(): void {
    this.RedeemCode.emit();
  }
}
