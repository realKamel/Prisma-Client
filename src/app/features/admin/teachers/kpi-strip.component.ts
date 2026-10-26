import { Component, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { CountUpDirective } from '../../../shared/directives/count-up/count-up.directive';
import { KpiTile } from '../models/teachers-admin.types';

@Component({
  selector: 'app-kpi-strip',
  imports: [NgmMotionDirective, CountUpDirective],
  templateUrl: './kpi-strip.component.html',
})
export class KpiStripComponent {
  public readonly tiles = input.required<KpiTile[]>();
}
