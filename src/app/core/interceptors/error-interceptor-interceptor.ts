import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { catchError, throwError } from 'rxjs';
import { IProblemDetails } from '../Models/problemDetails';
import { inject, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const errorInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const translate = injector.get(TranslateService);
      // 1. Ensure the error response is actually an object (JSON) and not HTML/String
      const isProblemDetails = error.error && typeof error.error === 'object';
      const problem = isProblemDetails ? (error.error as IProblemDetails) : undefined;

      // 2. Let the consuming form handle field-specific validation errors
      if (error.status === 400 && problem?.errors) {
        return throwError(() => error);
      }

      // 3. Determine the best user-friendly error message
      let errorMessage: string;

      if (error.status === 0) {
        // Network error, CORS issue, or server is completely offline
        errorMessage = translate.instant('COMMON.ERRORS.NETWORK_ERROR');
      } else if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        errorMessage = resolveErrorMessage(problem, error.status, translate);
      }

      toast.error(errorMessage);
      console.error(`[API Error] ${error.status}:`, errorMessage);

      return throwError(() => error);
    }),
  );
};

/** Best effort: use the backend `code` as a translation key, then its human-friendly
 *  detail/title as-is, then a generic status-based message as the last resort. */
function resolveErrorMessage(
  problem: IProblemDetails | undefined,
  status: number,
  translate: TranslateService,
): string {
  if (problem?.code) {
    const key = `COMMON.ERRORS.${problem.code}`;
    const translated = translate.instant(key);
    if (translated !== key) return translated;
  }

  // return problem?.detail ?? problem?.title ?? translate.instant(genericErrorKey(status));
  return problem?.detail ?? translate.instant(genericErrorKey(status));
}

/** Maps an HTTP status to a generic translation key when the backend gives no usable message. */
function genericErrorKey(status: number): string {
  switch (status) {
    case 400:
      return 'COMMON.ERRORS.BAD_REQUEST';
    case 401:
      return 'COMMON.ERRORS.UNAUTHORIZED';
    case 402:
      return 'COMMON.ERRORS.PAYMENT_REQUIRED';
    case 403:
      return 'COMMON.ERRORS.FORBIDDEN';
    case 404:
      return 'COMMON.ERRORS.NOT_FOUND';
    case 405:
      return 'COMMON.ERRORS.METHOD_NOT_ALLOWED';
    case 406:
      return 'COMMON.ERRORS.NOT_ACCEPTABLE';
    case 408:
      return 'COMMON.ERRORS.REQUEST_TIMEOUT';
    case 409:
      return 'COMMON.ERRORS.CONFLICT';
    case 410:
      return 'COMMON.ERRORS.GONE';
    case 415:
      return 'COMMON.ERRORS.UNSUPPORTED_MEDIA_TYPE';
    case 422:
      return 'COMMON.ERRORS.UNPROCESSABLE_ENTITY';
    case 429:
      return 'COMMON.ERRORS.TOO_MANY_REQUESTS';
    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
      return 'COMMON.ERRORS.SERVER_ERROR';
    default:
      return 'COMMON.ERRORS.UNEXPECTED_ERROR';
  }
}
