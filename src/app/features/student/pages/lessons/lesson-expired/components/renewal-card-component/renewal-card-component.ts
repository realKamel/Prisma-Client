import { Component, signal, output, input, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromoResult, RenewalPlan } from '../../../../../../../core/Models/lesson-expired';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCheck2,
  bootstrapArrowRepeat,
  bootstrapArrowClockwise,
} from '@ng-icons/bootstrap-icons';

// Known promo codes — in a real app this lives on the server
const PROMO_CODES: Record<string, PromoResult> = {
  SAVE20: {
    code: 'SAVE20',
    valid: true,
    message: 'خصم ٢٠٪ تم تطبيقه — السعر الجديد: ج١٢٠',
    newPrice: 'ج١٢٠',
  },
};

@Component({
  selector: 'app-renewal-card',
  imports: [FormsModule, NgIcon],
  templateUrl: './renewal-card-component.html',
  viewProviders: [
    provideIcons({
      bootstrapCheck2,
      bootstrapArrowRepeat,
      bootstrapArrowClockwise,
    }),
  ],
})
export class RenewalCardComponent implements OnInit {
  readonly plan = input.required<RenewalPlan>();
  readonly renewClicked = output<string>(); // emits active price

  protected readonly promoCode = signal('');
  protected readonly renewing = signal(false);
  protected readonly promoMsg = signal('');
  protected readonly promoMsgColor = signal('var(--muted)');
  protected readonly currentPrice = signal('');

  ngOnInit() {
    this.currentPrice.set(this.plan().priceLabel);
  }

  applyPromo() {
    const code = this.promoCode().trim().toUpperCase();
    if (!code) {
      this.promoMsg.set('أدخل كودًا أولًا.');
      this.promoMsgColor.set('var(--muted)');
      return;
    }
    const result = PROMO_CODES[code];
    if (result) {
      this.promoMsg.set(result.message);
      this.promoMsgColor.set('var(--mint)');
      if (result.newPrice) this.currentPrice.set(result.newPrice);
    } else {
      this.promoMsg.set('هذا الكود غير صالح أو منتهي.');
      this.promoMsgColor.set('var(--coral)');
    }
  }

  onRenew() {
    this.renewing.set(true);
    this.renewClicked.emit(this.currentPrice());
    // In a real app, navigate to payment gateway here
  }
}
