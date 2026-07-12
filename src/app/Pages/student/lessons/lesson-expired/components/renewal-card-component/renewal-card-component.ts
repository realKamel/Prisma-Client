import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromoResult, RenewalPlan } from '../../../../../../core/Models/lesson-expired';



// Known promo codes — in a real app this lives on the server
const PROMO_CODES: Record<string, PromoResult> = {
  SAVE20: { code: 'SAVE20', valid: true, message: 'خصم ٢٠٪ تم تطبيقه — السعر الجديد: ج١٢٠', newPrice: 'ج١٢٠' },
};

@Component({
  selector: 'app-renewal-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renewal-card-component.html',
})
export class RenewalCardComponent {
  @Input() plan!: RenewalPlan;
  @Output() renewClicked = new EventEmitter<string>(); // emits active price

  promoCode = '';
  renewing  = signal(false);
  promoMsg  = signal('');
  promoMsgColor = signal('var(--muted)');
  currentPrice  = signal('');

  ngOnInit() {
    this.currentPrice.set(this.plan.priceLabel);
  }


  applyPromo() {
    const code = this.promoCode.trim().toUpperCase();
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