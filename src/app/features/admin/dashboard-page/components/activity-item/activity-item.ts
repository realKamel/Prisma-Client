import { Component, computed, input } from '@angular/core';
import {
  bootstrapCashStack,
  bootstrapExclamationTriangleFill,
  bootstrapHddNetworkFill,
  bootstrapPeopleFill,
  bootstrapPersonPlusFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ActionIconConfig } from '../../../../../core/Models/Admin/activity-ui.model';
import { ActivityItemDto, ActivityType } from '../../../../../core/Models/Admin/dashboardmodel';
type ActivityIconConfig = ActionIconConfig;

@Component({
  selector: 'app-activity-item',
  imports: [NgIcon],
  templateUrl: './activity-item.html',
  viewProviders: [
    provideIcons({
      bootstrapPersonPlusFill,
      bootstrapCashStack,
      bootstrapExclamationTriangleFill,
      bootstrapPeopleFill,
      bootstrapHddNetworkFill,
    }),
  ],
})
export class ActivityItemComponent {
  public readonly activity = input.required<ActivityItemDto>();
  protected readonly config = computed(() => this.ACTIVITY_ICON_CONFIG[this.activity().type]);
  protected readonly icon = computed(() => this.config().icon);
  protected readonly iconBgClass = computed(() => this.config().bgClass);
  protected readonly iconColorClass = computed(() => this.config().colorClass);

  private readonly ACTIVITY_ICON_CONFIG: Record<ActivityType, ActivityIconConfig> = {
    enroll: {
      icon: 'bootstrapPersonPlusFill',
      bgClass: 'bg-[rgba(var(--color-primary-rgb),0.14)]',
      colorClass: 'text-primary-light',
    },
    payment: {
      icon: 'bootstrapCashStack',
      bgClass: 'bg-[rgba(78,203,141,0.14)]',
      colorClass: 'text-mint',
    },
    alert: {
      icon: 'bootstrapExclamationTriangleFill',
      bgClass: 'bg-[rgba(240,106,106,0.14)]',
      colorClass: 'text-coral',
    },
    teacher: {
      icon: 'bootstrapPeopleFill',
      bgClass: 'bg-[rgba(247,201,72,0.14)]',
      colorClass: 'text-star',
    },
    system: {
      icon: 'bootstrapHddNetworkFill',
      bgClass: 'bg-[rgba(var(--color-primary-rgb),0.14)]',
      colorClass: 'text-primary-light',
    },
  };
}
