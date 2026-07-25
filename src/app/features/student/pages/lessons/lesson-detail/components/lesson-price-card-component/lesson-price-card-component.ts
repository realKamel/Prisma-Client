import { Component, output, input } from '@angular/core';
import { LessonResponse } from '../../../../../../../core/Models/lesson.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCollection,
  bootstrapCloudArrowDown,
  bootstrapPatchCheck,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-lesson-price-card',
  imports: [NgIcon],
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
