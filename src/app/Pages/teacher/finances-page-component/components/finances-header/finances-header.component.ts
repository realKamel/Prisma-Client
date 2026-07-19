import { Component, input } from '@angular/core';

@Component({
  selector: 'app-finances-header',
  templateUrl: './finances-header.component.html',
})
export class FinancesHeaderComponent {
  readonly eyebrow = input('// الأرباح والمدفوعات');
  readonly title = input('الأرباح');
  readonly subtitle = input('ملخص إيراداتك وصافي أرباحك بعد رسوم المنصة');
}
