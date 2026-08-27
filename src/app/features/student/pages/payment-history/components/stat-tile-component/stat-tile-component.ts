import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapStars,
  bootstrapMortarboardFill,
  bootstrapCheckCircleFill,
  bootstrapXCircleFill,
} from '@ng-icons/bootstrap-icons';
import { CountUpDirective } from '../../../dashboard/directives/count-up.directive';
export type StatColorVariant = 'star' | 'purple' | 'mint' | 'coral';

@Component({
  selector: 'app-stat-tile',
  imports: [CountUpDirective, NgIcon],
  templateUrl: './stat-tile-component.html',
  viewProviders: [
    provideIcons({
      bootstrapStars,
      bootstrapMortarboardFill,
      bootstrapCheckCircleFill,
      bootstrapXCircleFill,
    }),
  ],
})
export class StatTileComponent {
  readonly icon = input.required<string>();
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly variant = input<StatColorVariant>('star');
  /** Use the smaller number size for larger figures like totals with currency. */
  readonly compact = input(false);

  private static readonly LINE_CLASSES: Record<StatColorVariant, string> = {
    star: 'bg-gradient-to-r from-transparent via-[var(--star)] to-transparent',
    purple: 'bg-gradient-to-r from-transparent via-primary to-transparent',
    mint: 'bg-gradient-to-r from-transparent via-mint to-transparent',
    coral: 'bg-gradient-to-r from-transparent via-[var(--coral)] to-transparent',
  };

  private static readonly ICON_BG_CLASSES: Record<StatColorVariant, string> = {
    star: 'bg-[rgba(247,201,72,0.12)]',
    purple: 'bg-[rgba(var(--accent-rgb),0.12)]',
    mint: 'bg-[rgba(78,203,141,0.12)]',
    coral: 'bg-[rgba(240,106,106,0.10)]',
  };

  private static readonly ICON_COLOR_CLASSES: Record<StatColorVariant, string> = {
    star: 'text-[var(--star)]',
    purple: 'text-primary-light',
    mint: 'text-mint',
    coral: 'text-coral',
  };

  topLineClass(): string {
    return StatTileComponent.LINE_CLASSES[this.variant()];
  }

  iconBgClass(): string {
    return StatTileComponent.ICON_BG_CLASSES[this.variant()];
  }

  iconColorClass(): string {
    return StatTileComponent.ICON_COLOR_CLASSES[this.variant()];
  }
}
