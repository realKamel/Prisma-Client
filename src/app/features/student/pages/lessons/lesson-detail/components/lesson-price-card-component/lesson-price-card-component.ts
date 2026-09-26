import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  bootstrapCloudArrowDown,
  bootstrapCollection,
  bootstrapPatchCheck,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LessonResponse } from '../../../../../../../core/Models/lesson.model';

@Component({
  selector: 'app-lesson-price-card',
  imports: [NgIcon, CurrencyPipe],
  templateUrl: './lesson-price-card-component.html',
  viewProviders: [
    provideIcons({
      bootstrapCollection,
      bootstrapCloudArrowDown,
      bootstrapPatchCheck,
    }),
  ],
})
export class LessonPriceCardComponent {
  public readonly lesson = input.required<LessonResponse>();

  // إضافة Output لإبلاغ الصفحة الأب
  public readonly buyClick = output<void>();
  public readonly RedeemCode = output<void>();

  public onBuyLesson(): void {
    // بدلاً من تنفيذ المنطق هنا، نرسل إشارة للأب
    this.buyClick.emit();
  }

  public onEnterPromoCode(): void {
    this.RedeemCode.emit();
  }
}
