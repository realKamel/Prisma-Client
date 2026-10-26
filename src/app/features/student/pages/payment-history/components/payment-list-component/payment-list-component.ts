import { Component, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { PaymentRecordDto } from '../../../../models/payment-history.model';
import { EmptyStateComponent } from '../empty-state-component/empty-state-component';
import { PaymentCardComponent } from '../payment-card-component/payment-card-component';

@Component({
  selector: 'app-payment-list',
  imports: [PaymentCardComponent, EmptyStateComponent, NgmMotionDirective],
  templateUrl: './payment-list-component.html',
})
export class PaymentListComponent {
  readonly payments = input.required<PaymentRecordDto[]>();
}
