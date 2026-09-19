import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { ActivityItemDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { ActivityItemComponent } from '../activity-item/activity-item';

@Component({
  selector: 'app-activity-feed',
  imports: [ActivityItemComponent, NgmMotionDirective, TranslatePipe],
  templateUrl: './activity-feed.html',
})
export class ActivityFeedComponent {
  public readonly activity = input.required<ActivityItemDto[]>();
}
