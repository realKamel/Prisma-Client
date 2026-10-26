import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InitiatePaymentRequest, InitiatePaymentResponse } from '../models/payment.model';

@Service()
export class PaymentService {
  private http = inject(HttpClient);

  initiatePayment(request: InitiatePaymentRequest): Observable<InitiatePaymentResponse> {
    return this.http.post<InitiatePaymentResponse>(
      `${environment.apiUrl}/payments/initiate`,
      request,
    );
  }
}
