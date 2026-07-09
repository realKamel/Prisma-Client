import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment.development';
import { StudentPaymentHistoryResponseDto } from '../Models/Student/payment-history.model';

@Injectable({ providedIn: 'root' })
export class PaymentHistoryService {
  private readonly http = inject(HttpClient);

  getPaymentHistory(): Observable<StudentPaymentHistoryResponseDto> {
    return this.http
      .get<
        ApiResponse<StudentPaymentHistoryResponseDto>
      >(`${environment.apiUrl}/Students/payments/history`)
      .pipe(map((res) => res.data!));
  }
}
