export type PaymentMethod = 'online' | 'code' | 'teacher grant';
export type PaymentFilter = PaymentMethod | 'all';
export type PaymentStatus = 'paid' | 'expired';
export type PosterVariant = 'energy' | 'magnet' | 'wave' | 'gear' | 'atom' | 'thermo' | 'optics';

export interface PaymentHistoryStatsDto {
  totalAmount: number;
  lessonsPurchased: number;
  activeLessons: number;
  expiredLessons: number;
}

export interface PaymentRecordDto {
  id: string;
  lessonTitle: string;
  lessonId: number;
  posterVariant: PosterVariant;
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
  all: number;
  online: number;
  code: number;
  'teacher grant': number;
}
