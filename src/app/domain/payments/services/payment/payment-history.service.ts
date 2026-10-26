import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { StudentPaymentHistoryResponseDto } from '../../../../features/student/models/payment-history.model';

@Service()
export class PaymentHistoryService {
  private readonly http = inject(HttpClient);

  public getPaymentHistory(): Observable<StudentPaymentHistoryResponseDto> {
    return this.http.get<StudentPaymentHistoryResponseDto>(
      `${environment.apiUrl}/students/payments/history`,
    );
  }
}
