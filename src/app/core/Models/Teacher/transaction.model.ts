import { Money } from '../money.model';

export interface Transaction {
  id: string;
  studentName: string;
  lessonTitle: string;
  money: Money;
  /** ISO date string (e.g. '2026-06-06'). Formatted for display via ArDatePipe. */
  date: string;
  // Derived on the frontend — not returned by the API
  platformFee: number;
  netAmount: number;
}
