import { Component, input } from '@angular/core';
import { EmptyStateComponent } from '../empty-state-component/empty-state-component';
import { PaymentCardComponent } from '../payment-card-component/payment-card-component';
import { PaymentRecordDto } from '../../../../../../core/Models/Student/payment-history.model';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
  selector: 'app-payment-list',
  imports: [PaymentCardComponent, EmptyStateComponent, NgmMotionDirective],
  templateUrl: './payment-list-component.html',
})
export class PaymentListComponent {
  readonly payments = input.required<PaymentRecordDto[]>();
}
