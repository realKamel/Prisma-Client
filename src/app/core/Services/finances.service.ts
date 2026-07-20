import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';

import { FinanceSummary } from '../Models/Teacher/finance-summary.model';
import { Transaction } from '../Models/Teacher/transaction.model';
import { MonthlyRevenuePoint } from '../Models/Teacher/finance-summary.model';
import {
  TeacherFinancesResponse,
  TransactionApiItem,
} from '../Models/Teacher/teacher-finances-response.model';
import { environment } from '../../../environments/environment';

const PLATFORM_FEE_RATE = 0.15;
const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];
const TRAILING_MONTHS_COUNT = 6;

@Injectable({ providedIn: 'root' })
export class FinancesService {
  private readonly endpoint = `${environment.apiUrl}/Teachers/finances`;

  readonly loading = signal<boolean>(false);
  readonly transactions = signal<Transaction[]>([]);

  readonly summary = computed<FinanceSummary>(() => {
    const txns = this.transactions();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const totalRevenue = +txns.reduce((sum, t) => sum + t.amount, 0).toFixed(2);
    const platformFeeAmount = +(totalRevenue * PLATFORM_FEE_RATE).toFixed(2);
    const netProfit = +(totalRevenue - platformFeeAmount).toFixed(2);

    const monthRevenue = +txns
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0)
      .toFixed(2);

    const prevMonthRevenue = +txns
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((sum, t) => sum + t.amount, 0)
      .toFixed(2);

    const monthGrowthPercent =
      prevMonthRevenue > 0
        ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : monthRevenue > 0
          ? 100
          : 0;

    return {
      totalRevenue,
      monthRevenue,
      monthGrowthPercent,
      platformFeeRate: PLATFORM_FEE_RATE,
      platformFeeAmount,
      netProfit,
    };
  });

  readonly monthlyRevenue = computed<MonthlyRevenuePoint[]>(() => {
    const txns = this.transactions();
    const now = new Date();

    const buckets: { year: number; month: number }[] = [];
    for (let i = TRAILING_MONTHS_COUNT - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ year: d.getFullYear(), month: d.getMonth() });
    }

    return buckets.map(({ year, month }) => {
      const amount = +txns
        .filter((t) => {
          const d = new Date(t.date);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2);

      return {
        month: ARABIC_MONTHS[month],
        amount,
        isCurrent: year === now.getFullYear() && month === now.getMonth(),
      };
    });
  });

  constructor(private readonly http: HttpClient) {}

  loadFinances(): void {
    this.loading.set(true);

    this.http
      .get<TeacherFinancesResponse>(this.endpoint)
      .pipe(
        tap((response) => {
          if (response.succeeded) {
            this.transactions.set(this.mapTransactions(response.data));
          } else {
            this.transactions.set([]);
          }
        }),
        catchError((error) => {
          console.error('Failed to load teacher finances', error);
          this.transactions.set([]);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  private mapTransactions(items: TransactionApiItem[]): Transaction[] {
    return items.map((item) => ({
      ...item,
      platformFee: +(item.amount * PLATFORM_FEE_RATE).toFixed(2),
      netAmount: +(item.amount * (1 - PLATFORM_FEE_RATE)).toFixed(2),
    }));
  }
}
