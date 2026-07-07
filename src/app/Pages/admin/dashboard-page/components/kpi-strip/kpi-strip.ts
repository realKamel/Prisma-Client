import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KpiDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { KpiTile } from '../kpi-tile/kpi-tile';


@Component({
  selector: 'app-kpi-strip',
  standalone: true,
  imports: [KpiTile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpi-strip.html',
})
export class KpiStrip {
  readonly kpis = input.required<KpiDto[]>();
}