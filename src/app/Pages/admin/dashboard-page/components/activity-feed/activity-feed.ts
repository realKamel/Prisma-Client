import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActivityItemDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { ActivityItem } from '../activity-item/activity-item';

@Component({
  selector: 'app-activity-feed',
  imports: [ActivityItem],
  templateUrl: './activity-feed.html',
})
export class ActivityFeed {
  readonly activity = input.required<ActivityItemDto[]>();
}
