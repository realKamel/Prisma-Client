import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiTile } from '../../../core/Models/Admin/teachers-admin.types';
import { toAr } from './to-ar';


@Component({
  selector: 'app-kpi-strip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-strip.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class KpiStripComponent {
  @Input({ required: true }) tiles!: KpiTile[];

  readonly toAr = toAr;
}
