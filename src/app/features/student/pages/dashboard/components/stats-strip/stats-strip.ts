import { Component, input } from '@angular/core';

import {
  bootstrapCheckCircleFill,
  bootstrapClockFill,
  bootstrapJournalBookmarkFill,
  bootstrapTrophyFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CountUpDirective } from '../../../../../../shared/directives/count-up/count-up.directive';
import { StatsDto } from '../../../../models/dashboard.models';

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
export class StatsStripComponent {
  public readonly stats = input.required<StatsDto>();
}
