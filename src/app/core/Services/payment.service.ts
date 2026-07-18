import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InitiatePaymentRequest {
  amountCents: number;
  email: string;
  firstName: string;
  lastName: string;
  method: number;
  studentId: string;
  lessonId: number;
}
export interface InitiatePaymentResponse {
  clientSecret: string;
  publicKey: string;
}

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
