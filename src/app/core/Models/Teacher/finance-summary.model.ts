/** All fields are derived/computed on the frontend from raw transaction data. */
export interface FinanceSummary {
  totalRevenue: number;
  monthRevenue: number;
  monthGrowthPercent: number;
  platformFeeRate: number; // e.g. 0.15 for 15%
  platformFeeAmount: number;
  netProfit: number;
}
export interface MonthlyRevenuePoint {
  month: string;   // Arabic short month label, e.g. 'يناير'
  amount: number;
  isCurrent: boolean;
}