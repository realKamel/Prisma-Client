import { Component, input } from '@angular/core';
import { KpiDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { KpiTileComponent } from '../kpi-tile/kpi-tile';

@Component({
  selector: 'app-kpi-strip',
  imports: [KpiTileComponent],
  templateUrl: './kpi-strip.html',
})
export class KpiStripComponent {
  readonly kpis = input.required<KpiDto[]>();
}
