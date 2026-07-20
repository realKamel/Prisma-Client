// dashboard/components/stats-strip/stats-strip.component.ts
import { Component, input } from '@angular/core';

import { CountUpDirective } from '../../directives/count-up.directive';
import { StatsDto } from '../../../../../core/Models/Student/Dashboard.Models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapJournalBookmarkFill,
  bootstrapCheckCircleFill,
  bootstrapClockFill,
  bootstrapTrophyFill,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-stats-strip',
  imports: [CountUpDirective, NgIcon],
  templateUrl: './stats-strip.html',
  viewProviders: [
    provideIcons({
      bootstrapJournalBookmarkFill,
      bootstrapCheckCircleFill,
      bootstrapClockFill,
      bootstrapTrophyFill,
    }),
  ],
})
export class StatsStrip {
  readonly stats = input.required<StatsDto>();
}
