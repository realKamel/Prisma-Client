import { FinanceSummary } from "./finance-summary.model";
import { Transaction } from "./transaction.model";

export interface TeacherFinancesResponse {
  summary: FinanceSummary;
  transactions: Transaction[];
}
