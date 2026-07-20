/** Raw transaction item as returned by the API (no derived fields). */
export interface TransactionApiItem {
  id: string;
  studentName: string;
  lessonTitle: string;
  amount: number;
  date: string;
}

/** ApiResponse<T> wrapper used by the backend. */
export interface TeacherFinancesResponse {
  data: TransactionApiItem[];
  meta: null;
  succeeded: boolean;
  message: string;
  errors: null | string[];
}