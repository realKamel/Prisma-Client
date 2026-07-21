import { Component, computed, input } from '@angular/core';
import { ActivityItemDto, ActivityType } from '../../../../../core/Models/Admin/dashboardmodel';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapPersonPlusFill,
  bootstrapCashStack,
  bootstrapExclamationTriangleFill,
  bootstrapPeopleFill,
  bootstrapHddNetworkFill,
} from '@ng-icons/bootstrap-icons';

interface ActivityIconConfig {
  icon: string;
  bgClass: string;
  colorClass: string;
}

const ACTIVITY_ICON_CONFIG: Record<ActivityType, ActivityIconConfig> = {
  enroll: {
    icon: 'bootstrapPersonPlusFill',
    bgClass: 'bg-[rgba(var(--accent-rgb),0.14)]',
    colorClass: 'text-[var(--purple-lt)]',
  },
  payment: {
    icon: 'bootstrapCashStack',
    bgClass: 'bg-[rgba(78,203,141,0.14)]',
    colorClass: 'text-[var(--mint)]',
  },
  alert: {
    icon: 'bootstrapExclamationTriangleFill',
    bgClass: 'bg-[rgba(240,106,106,0.14)]',
    colorClass: 'text-[var(--coral)]',
  },
  teacher: {
    icon: 'bootstrapPeopleFill',
    bgClass: 'bg-[rgba(247,201,72,0.14)]',
    colorClass: 'text-[var(--star)]',
  },
  system: {
    icon: 'bootstrapHddNetworkFill',
    bgClass: 'bg-[rgba(var(--accent-rgb),0.14)]',
    colorClass: 'text-[var(--purple-lt)]',
  },
};

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
export class ActivityItem {
  readonly activity = input.required<ActivityItemDto>();
  protected readonly config = computed(() => ACTIVITY_ICON_CONFIG[this.activity().type]);
  protected readonly icon = computed(() => this.config().icon);
  protected readonly iconBgClass = computed(() => this.config().bgClass);
  protected readonly iconColorClass = computed(() => this.config().colorClass);
}
