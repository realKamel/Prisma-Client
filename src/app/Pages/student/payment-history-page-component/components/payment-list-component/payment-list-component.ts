import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PaymentRecordDto } from '../../../../../core/Models/Student/payment-history.model';
import { EmptyStateComponent } from '../empty-state-component/empty-state-component';
import { PaymentCardComponent } from '../payment-card-component/payment-card-component';


@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [PaymentCardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-list-component.html',
})
export class PaymentListComponent {
  readonly payments = input.required<PaymentRecordDto[]>();
}