import { Component, computed, inject, input } from '@angular/core';
import { FinanceSummary } from '../../../../../core/Models/Teacher/finance-summary.model';
import { CountUpDirective } from '../directives/count-up.directive';
import { DecimalPipe } from '@angular/common';

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

  imports: [CountUpDirective],
  templateUrl: './finances-summary.component.html',
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
        icon: 'bi-wallet2',
        iconColorClass: 'text-[var(--purple)]',
        accentBorderClass: 'border-t-4 border-t-[var(--purple)]',
        textcolorclass: 'text-[var(--ink)]',
        sub: 'منذ بداية الحساب',
        subTone: 'neutral',
        subToneClass: 'text-[var(--muted)]',
      },
      {
        label: 'هذا الشهر',
        value: summary.monthRevenue,
        icon: 'bi-graph-up-arrow',
        iconColorClass: 'text-[var(--mint)]',
        accentBorderClass: 'border-t-4 border-t-[var(--mint)]',
        textcolorclass: 'text-[var(--ink)]',
        sub: `${isGrowthPositive ? '+' : '-'}${growthAr}٪ عن الشهر الماضي`,
        subTone: isGrowthPositive ? 'up' : 'neutral',
        subToneClass: isGrowthPositive ? 'text-[var(--mint)]' : 'text-[var(--coral)]',
      },
      {
        label: `رسوم المنصة (${feePercentAr}٪)`,
        value: summary.platformFeeAmount,
        icon: 'bi-percent',
        iconColorClass: 'text-[var(--coral)]',
        accentBorderClass: 'border-t-4 border-t-[var(--coral)]',
        textcolorclass: 'text-[var(--coral)]',
        sub: `${feePercentAr}٪ من الإجمالي`,
        subTone: 'neutral',
        subToneClass: 'text-[var(--muted)]',
      },
      {
        label: 'صافي الأرباح',
        value: summary.netProfit,
        icon: 'bi-cash-stack',
        iconColorClass: 'text-[var(--mint)]',
        accentBorderClass: 'border-t-4 border-t-[var(--mint)]',
        textcolorclass: 'text-[var(--mint)]',
        sub: 'بعد خصم رسوم المنصة',
        subTone: 'neutral',
        subToneClass: 'text-[var(--muted)]',
      },
    ];
  }
}
