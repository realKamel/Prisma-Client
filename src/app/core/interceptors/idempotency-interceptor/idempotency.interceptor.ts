import { HttpInterceptorFn } from '@angular/common/http';

export const idempotencyInterceptor: HttpInterceptorFn = (req, next) => {
  // Define methods that require idempotency protection
  const idempotentMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  // Only apply to state-changing (un-safe) methods and if the header isn't already manually set
  if (
    idempotentMethods.includes(req.method.toUpperCase()) &&
    !req.headers.has('X-Idempotency-Key')
  ) {
    // Generate a secure UUID v4 (supported in all modern browsers & secure contexts)
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : generateFallbackUUID();

    const clonedRequest = req.clone({
      setHeaders: {
        'X-Idempotency-Key': idempotencyKey,
      },
    });

    return next(clonedRequest);
  }

  return next(req);
};

//Fallback UUID v4 generator for legacy environments
function generateFallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
