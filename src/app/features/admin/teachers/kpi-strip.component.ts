import { Component, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { KpiTile } from '../../../core/Models/Admin/teachers-admin.types';
import { CountUpDirective } from '../../../shared/directives/count-up/count-up.directive';

@Component({
  selector: 'app-kpi-strip',
  imports: [NgmMotionDirective, CountUpDirective],
  templateUrl: './kpi-strip.component.html',
})
export class KpiStripComponent {
  public readonly tiles = input.required<KpiTile[]>();
}
