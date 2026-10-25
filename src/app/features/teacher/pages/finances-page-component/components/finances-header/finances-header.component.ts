import { Component, input } from '@angular/core';

@Component({
  selector: 'app-finances-header',
  templateUrl: './finances-header.component.html',
})
export class FinancesHeaderComponent {
  public readonly eyebrow = input('الأرباح والمدفوعات');
  public readonly title = input('الأرباح');
  public readonly subtitle = input('ملخص إيراداتك وصافي أرباحك بعد رسوم المنصة');
}
