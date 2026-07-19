// dashboard/components/stats-strip/stats-strip.component.ts
import { Component, input } from '@angular/core';

import { CountUpDirective } from '../../directives/count-up.directive';
import { StatsDto } from '../../../../../core/Models/Student/Dashboard.Models';

@Component({
  selector: 'app-stats-strip',

  imports: [CountUpDirective],
  templateUrl: './stats-strip.html',
})
export class StatsStrip {
  readonly stats = input.required<StatsDto>();
}
