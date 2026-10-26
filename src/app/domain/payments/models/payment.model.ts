/** Request payload for initiating a payment */
export interface InitiatePaymentRequest {
  amountCents: number;
  email: string;
  firstName: string;
  lastName: string;
  method: number;
  studentId: string;
  lessonId: number;
}

/** Response returned after initiating a payment */
export interface InitiatePaymentResponse {
  clientSecret: string;
  publicKey: string;
}
