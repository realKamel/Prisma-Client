import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-finances-header',
  standalone: true,
  templateUrl: './finances-header.component.html',
})
export class FinancesHeaderComponent {
  @Input() eyebrow = '// الأرباح والمدفوعات';
  @Input() title = 'الأرباح';
  @Input() subtitle = 'ملخص إيراداتك وصافي أرباحك بعد رسوم المنصة';
}
