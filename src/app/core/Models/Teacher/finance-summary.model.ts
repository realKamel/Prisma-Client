export interface FinanceSummary {
  totalRevenue: number;
  monthRevenue: number;
  monthGrowthPercent: number;
  platformFeeRate: number; // e.g. 0.15 for 15%
  platformFeeAmount: number;
  netProfit: number;
}
