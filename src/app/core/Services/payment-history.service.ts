import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentPaymentHistoryResponseDto } from '../Models/Student/payment-history.model';

@Service()
export class PaymentHistoryService {
  private readonly http = inject(HttpClient);

  getPaymentHistory(): Observable<StudentPaymentHistoryResponseDto> {
    return this.http.get<StudentPaymentHistoryResponseDto>(
      `${environment.apiUrl}/Students/payments/history`,
    );
  }
}
