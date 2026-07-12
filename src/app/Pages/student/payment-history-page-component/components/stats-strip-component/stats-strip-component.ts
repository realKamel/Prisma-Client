import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PaymentHistoryStatsDto } from '../../../../../core/Models/Student/payment-history.model';
import { StatTileComponent } from '../stat-tile-component/stat-tile-component';


@Component({
  selector: 'app-stats-strip',
  standalone: true,
  imports: [StatTileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-strip-component.html',
})
export class StatsStripComponent {
  readonly stats = input.required<PaymentHistoryStatsDto>();
}