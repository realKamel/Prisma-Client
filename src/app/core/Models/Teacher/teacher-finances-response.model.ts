/** Raw transaction item as returned by the API (no derived fields). */
export interface TransactionApiItem {
  id: string;
  studentName: string;
  lessonTitle: string;
  amount: number;
  date: string;
}
