import { HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError, timer } from "rxjs";

const MAX_BACKOFF_MS = 8_000;
const MAX_RETRY_AFTER_MS = 15_000;

/**
 * Statuses worth retrying:
 *  0   -> network error (offline, connection dropped)
 *  408 -> request timeout
 *  409 -> concurrent insert conflict (the retry takes the update path)
 *  429 -> rate limited
 *  5xx -> server error
 * Everything else (400, 401, 403, 404, 422...) will fail again, so retrying only wastes time.
 */
export function isRetryableStatus(status: number): boolean {
  return status === 0 || status === 408 || status === 409 || status === 429 || status >= 500;
}

/** Use as: retry({ count: n, delay: backoffDelay }) */
export function backoffDelay(err: unknown, attempt: number): Observable<number> {
  // Not an HTTP error (e.g. a bug in our own code): never retry it
  if (!(err instanceof HttpErrorResponse) || !isRetryableStatus(err.status)) {
    return throwError(() => err);
  }

  const retryAfterSec = Number(err.headers?.get('Retry-After'));
  const delayMs =
    retryAfterSec > 0
      ? Math.min(retryAfterSec * 1000, MAX_RETRY_AFTER_MS) // honor the server, but never wait too long in an exam
      : Math.min(1000 * 2 ** (attempt - 1), MAX_BACKOFF_MS); // 1s, 2s, 4s, 8s, 8s...

  // Small jitter so many students recovering at once don't retry in lockstep
  return timer(delayMs + Math.random() * 300);
}
