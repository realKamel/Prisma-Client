import { Component, computed, inject, input } from '@angular/core';
import { FinanceSummary } from '../../../../../core/Models/Teacher/finance-summary.model';
import { CountUpDirective } from '../directives/count-up.directive';
import { DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowUp,
  bootstrapWallet2,
  bootstrapGraphUpArrow,
  bootstrapPercent,
  bootstrapCashStack,
} from '@ng-icons/bootstrap-icons';

interface SummaryCardConfig {
  label: string;
  value: number;
  icon: string;
  iconColorClass: string;
  accentBorderClass: string;
  textcolorclass: string;
  sub: string;
  subTone: 'up' | 'neutral';
  subToneClass: string;
}

@Component({
  selector: 'app-finances-summary',
  imports: [CountUpDirective, NgIcon],
  templateUrl: './finances-summary.component.html',
  providers: [DecimalPipe],
  viewProviders: [
    provideIcons({
      bootstrapArrowUp,
      bootstrapWallet2,
      bootstrapGraphUpArrow,
      bootstrapPercent,
      bootstrapCashStack,
    }),
  ],
})
export class FinancesSummaryComponent {
  // 1. Reactive Signal Inputs
  readonly loading = input<boolean>(false);
  readonly summary = input<FinanceSummary | null>(null);
  private readonly numberPipe = inject(DecimalPipe);

  // 2. Computed state replaces the old setter + mutable array combo
  readonly cards = computed<SummaryCardConfig[]>(() => {
    const summaryValue = this.summary();
    return summaryValue ? this.buildCards(summaryValue) : [];
  });

  private buildCards(summary: FinanceSummary): SummaryCardConfig[] {
    const feePercentAr = this.numberPipe.transform(Math.round(summary.platformFeeRate * 100));
    const growthAr = this.numberPipe.transform(Math.abs(summary.monthGrowthPercent));
    const isGrowthPositive = summary.monthGrowthPercent >= 0;

    return [
      {
        label: 'إجمالي الإيرادات',
        value: summary.totalRevenue,
        icon: 'bootstrapWallet2',
        iconColorClass: 'text-primary',
        accentBorderClass: 'border-t-4 border-t-primary',
        textcolorclass: 'text-ink',
        sub: 'منذ بداية الحساب',
        subTone: 'neutral',
        subToneClass: 'text-muted',
      },
      {
        label: 'هذا الشهر',
        value: summary.monthRevenue,
        icon: 'bootstrapGraphUpArrow',
        iconColorClass: 'text-mint',
        accentBorderClass: 'border-t-4 border-t-mint',
        textcolorclass: 'text-ink',
        sub: `${isGrowthPositive ? '+' : '-'}${growthAr}٪ عن الشهر الماضي`,
        subTone: isGrowthPositive ? 'up' : 'neutral',
        subToneClass: isGrowthPositive ? 'text-mint' : 'text-coral',
      },
      {
        label: `رسوم المنصة (${feePercentAr}٪)`,
        value: summary.platformFeeAmount,
        icon: 'bootstrapPercent',
        iconColorClass: 'text-coral',
        accentBorderClass: 'border-t-4 border-t-[var(--coral)]',
        textcolorclass: 'text-coral',
        sub: `${feePercentAr}٪ من الإجمالي`,
        subTone: 'neutral',
        subToneClass: 'text-muted',
      },
      {
        label: 'صافي الأرباح',
        value: summary.netProfit,
        icon: 'bootstrapCashStack',
        iconColorClass: 'text-mint',
        accentBorderClass: 'border-t-4 border-t-mint',
        textcolorclass: 'text-mint',
        sub: 'بعد خصم رسوم المنصة',
        subTone: 'neutral',
        subToneClass: 'text-muted',
      },
    ];
  }
}
