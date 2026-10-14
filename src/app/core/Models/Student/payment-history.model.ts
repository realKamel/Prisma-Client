export type PaymentMethod = 'ONLINE' | 'CODE' | 'TEACHER_GRANT';
export type PaymentFilter = PaymentMethod | 'ALL';
export type PaymentStatus = 'paid' | 'expired';

export interface PaymentHistoryStatsDto {
  totalAmount: number;
  lessonsPurchased: number;
  activeLessons: number;
  expiredLessons: number;
}

export interface PaymentRecordDto {
  id: string;
  lessonTitle: string;
  lessonId: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
}

export interface StudentPaymentHistoryResponseDto {
  stats: PaymentHistoryStatsDto;
  payments: PaymentRecordDto[];
}

/** Counts per payment-filter category, used in filter-chips */
export interface PaymentFilterCounts {
  ALL: number;
  ONLINE: number;
  CODE: number;
  TEACHER_GRANT: number;
}
