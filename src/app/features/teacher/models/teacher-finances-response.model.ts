import { Money } from '../../../domain/value-objects/money.model';
/** Raw transaction item as returned by the API (no derived fields). */
export interface TransactionApiItem {
  id: string;
  studentName: string;
  lessonTitle: string;
  money: Money;
  date: string;
}
