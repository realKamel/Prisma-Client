import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const idempotencyInterceptor: HttpInterceptorFn = (req, next) => {
  //Methods that require idempotency protection
  const idempotentMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (
    !idempotentMethods.includes(req.method.toUpperCase()) ||
    req.headers.has('X-Idempotency-Key')
  ) {
    return next(req);
  }

  //fingerprint of the request URL + body to ensure retries use the SAME key
  const fingerprint = createFingerprint(req);
  const storageKey = `idem_${fingerprint}`;

  let idempotencyKey = sessionStorage.getItem(storageKey);
  if (!idempotencyKey) {
    idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : generateFallbackUUID();
    sessionStorage.setItem(storageKey, idempotencyKey);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      'X-Idempotency-Key': idempotencyKey,
    },
  });

  return next(clonedRequest).pipe(
    tap({
      next: (event) => {
        // Clear storage once the request successfully completes
        if (event instanceof HttpResponse && event.ok) {
          sessionStorage.removeItem(storageKey);
        }
      },
      error: () => {
        // Optionally keep the key for a short duration in case of immediate client-side retries,
        // or clear it depending on your error handling strategy.
      },
    }),
  );
};
function createFingerprint(req: HttpRequest<unknown>): string {
  let bodyString = '';

  if (req.body instanceof FormData) {
    const formParts: string[] = [];
    // FormData entries can be strings or Files/Blobs
    req.body.forEach((value, key) => {
      if (value instanceof File) {
        // Include file metadata so changing the file changes the fingerprint
        formParts.push(`${key}=file:${value.name}:${value.size}:${value.type}`);
      } else {
        formParts.push(`${key}=${value}`);
      }
    });
    bodyString = formParts.sort().join('&'); // Sort to keep order consistent
  } else if (req.body) {
    try {
      bodyString = JSON.stringify(req.body);
    } catch {
      bodyString = String(req.body);
    }
  }

  const rawData = `${req.method}|${req.urlWithParams}|${bodyString}`;
  const utf8Bytes = new TextEncoder().encode(rawData);

  // Convert bytes to a binary string cleanly
  let binaryString = '';
  for (const byte of utf8Bytes) {
    binaryString += String.fromCharCode(byte);
  }
  return btoa(binaryString);
}
function generateFallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
