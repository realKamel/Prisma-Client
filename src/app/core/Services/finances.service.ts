import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { catchError, finalize, of, tap } from 'rxjs';

import { FinanceSummary } from '../Models/Teacher/finance-summary.model';
import { Transaction } from '../Models/Teacher/transaction.model';
import { TeacherFinancesResponse } from '../Models/Teacher/teacher-finances-response.model';

@Injectable({ providedIn: 'root' })
export class FinancesService {
  // TODO: point this at the real endpoint once it's ready, e.g.
  // `${environment.apiUrl}/teacher/finances`.
  // The static JSON file mirrors the expected DTO shape exactly. If the real
  // API wraps responses in ApiResponse<T> (per the project's Result<T> /
  // ApiResponse<T> convention), unwrap `response.data` in the `tap` below
  // instead of using `response` directly.
  private readonly endpoint = '/assets/data/teacher-finances.json';

  private readonly summarySubject = new BehaviorSubject<FinanceSummary | null>(null);
  private readonly transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly summary$ = this.summarySubject.asObservable();
  readonly transactions$ = this.transactionsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadFinances(): void {
    this.loadingSubject.next(true);

    this.http
      .get<TeacherFinancesResponse>(this.endpoint)
      .pipe(
        tap((response) => {
          this.summarySubject.next(response.summary);
          this.transactionsSubject.next(response.transactions);
        }),
        catchError((error) => {
          console.error('Failed to load teacher finances', error);
          this.summarySubject.next(null);
          this.transactionsSubject.next([]);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }
}
