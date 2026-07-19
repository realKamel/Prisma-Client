import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ActivityItemDto, ActivityType } from '../../../../../core/Models/Admin/dashboardmodel';

interface ActivityIconConfig {
  icon: string;
  bgClass: string;
  colorClass: string;
}

const ACTIVITY_ICON_CONFIG: Record<ActivityType, ActivityIconConfig> = {
  enroll: {
    icon: 'bi-person-plus-fill',
    bgClass: 'bg-[rgba(var(--accent-rgb),0.14)]',
    colorClass: 'text-[var(--purple-lt)]',
  },
  payment: {
    icon: 'bi-cash-stack',
    bgClass: 'bg-[rgba(78,203,141,0.14)]',
    colorClass: 'text-[var(--mint)]',
  },
  alert: {
    icon: 'bi-exclamation-triangle-fill',
    bgClass: 'bg-[rgba(240,106,106,0.14)]',
    colorClass: 'text-[var(--coral)]',
  },
  teacher: {
    icon: 'bi-people-fill',
    bgClass: 'bg-[rgba(247,201,72,0.14)]',
    colorClass: 'text-[var(--star)]',
  },
  system: {
    icon: 'bi-hdd-network-fill',
    bgClass: 'bg-[rgba(var(--accent-rgb),0.14)]',
    colorClass: 'text-[var(--purple-lt)]',
  },
};

@Component({
  selector: 'app-activity-item',
  imports: [],
  templateUrl: './activity-item.html',
})
export class ActivityItem {
  readonly activity = input.required<ActivityItemDto>();

  private readonly config = computed(() => ACTIVITY_ICON_CONFIG[this.activity().type]);

  icon(): string {
    return this.config().icon;
  }

  iconBgClass(): string {
    return this.config().bgClass;
  }

  iconColorClass(): string {
    return this.config().colorClass;
  }
}
