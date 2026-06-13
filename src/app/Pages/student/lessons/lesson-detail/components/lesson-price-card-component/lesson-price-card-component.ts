import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LessonResponse } from '../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-price-card',
  standalone: true,
  templateUrl: './lesson-price-card-component.html'
})
export class LessonPriceCardComponent {
  @Input({ required: true }) lesson!: LessonResponse;
  
  // إضافة Output لإبلاغ الصفحة الأب
  @Output() buyClick = new EventEmitter<void>();

  public onBuyLesson(): void {
    // بدلاً من تنفيذ المنطق هنا، نرسل إشارة للأب
    this.buyClick.emit();
  }

  public onEnterPromoCode(): void {
    console.log('Promo code drawer opened.');
  }
}