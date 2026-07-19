import { Component, output, input } from '@angular/core';

@Component({
  selector: 'app-payment-method',
  imports: [],
  templateUrl: './payment-method-component.html',
})
export class PaymentMethodComponent {
  readonly data = input<any>(undefined);
  readonly selected = input(false);
  readonly select = output<string>();
}
