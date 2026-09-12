import { Component, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { ActivityItemDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { ActivityItem } from '../activity-item/activity-item';

@Component({
  selector: 'app-activity-feed',
  imports: [ActivityItem, NgmMotionDirective],
  templateUrl: './activity-feed.html',
})
export class ActivityFeed {
  readonly activity = input.required<ActivityItemDto[]>();
}
