export interface Transaction {
  id: string;
  studentName: string;
  lessonTitle: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  /** ISO date string (e.g. '2026-05-06'). Formatted for display via ArDatePipe. */
  date: string;
}
