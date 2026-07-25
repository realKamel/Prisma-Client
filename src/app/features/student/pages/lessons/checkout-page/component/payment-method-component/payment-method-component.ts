import { Component, output, input } from '@angular/core';
import { bootstrapCheckCircleFill, bootstrapWallet2 } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-payment-method',
  imports: [NgIcon],
  templateUrl: './payment-method-component.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckCircleFill,
      bootstrapWallet2,
    }),
  ],
})
export class PaymentMethodComponent {
  readonly data = input<any>(undefined);
  readonly selected = input(false);
  readonly select = output<string>();
}
