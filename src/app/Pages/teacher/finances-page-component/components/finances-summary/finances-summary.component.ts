import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceSummary } from '../../../../../core/Models/Teacher/finance-summary.model';
import { toAr } from '../../to-ar.util';
import { CountUpDirective } from '../directives/count-up.directive';

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
  standalone: true,
  imports: [CommonModule, CountUpDirective],
  templateUrl: './finances-summary.component.html',
})
export class FinancesSummaryComponent {
  @Input() loading: boolean = false;

  cards: SummaryCardConfig[] = [];

  @Input()
  set summary(value: FinanceSummary | null) {
    this.cards = value ? this.buildCards(value) : [];
  }

  private buildCards(summary: FinanceSummary): SummaryCardConfig[] {
    const feePercentAr = toAr(Math.round(summary.platformFeeRate * 100));
    const growthAr = toAr(Math.abs(summary.monthGrowthPercent));
    const isGrowthPositive = summary.monthGrowthPercent >= 0;

    return [
      {
        label: 'إجمالي الإيرادات',
        value: summary.totalRevenue,
        icon: 'bi-wallet2',
        iconColorClass: 'text-[var(--purple)]',
        accentBorderClass: 'border-t-4 border-t-[var(--purple)]',
        textcolorclass:'text-[var(--ink)]',
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
        textcolorclass:'text-[var(--ink)]',
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
        textcolorclass:'text-[var(--coral)]',
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
        textcolorclass:'text-[var(--mint)]',
        sub: 'بعد خصم رسوم المنصة',
        subTone: 'neutral',
        subToneClass: 'text-[var(--muted)]',
      },
    ];
  }
}