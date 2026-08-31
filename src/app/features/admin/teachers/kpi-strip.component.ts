import { Component, input } from '@angular/core';
import { KpiTile } from '../../../core/Models/Admin/teachers-admin.types';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-kpi-strip',
  imports: [DecimalPipe],
  templateUrl: './kpi-strip.component.html',
})
export class KpiStripComponent {
  readonly tiles = input.required<KpiTile[]>();
}
