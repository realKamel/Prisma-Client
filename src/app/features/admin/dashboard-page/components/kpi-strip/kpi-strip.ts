import { Component, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { KpiDto } from '../../../models/dashboardmodel';
import { KpiTileComponent } from '../kpi-tile/kpi-tile';

@Component({
  selector: 'app-kpi-strip',
  imports: [KpiTileComponent, NgmMotionDirective],
  templateUrl: './kpi-strip.html',
})
export class KpiStripComponent {
  public readonly kpis = input.required<KpiDto[]>();
}
