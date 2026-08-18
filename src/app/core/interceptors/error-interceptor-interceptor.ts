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
      // 1. Let the auth interceptor handle token refresh for 401.
      if (error.status === 401) {
        return throwError(() => error);
      }
      const translate = injector.get(TranslateService);
      // 2. Ensure the error response is actually an object (JSON) and not HTML/String
      const isProblemDetails = error.error && typeof error.error === 'object';
      const problem = isProblemDetails ? (error.error as IProblemDetails) : undefined;

      // 3. Let the consuming form handle field-specific validation errors
      if (error.status === 400 && problem?.errors) {
        return throwError(() => error);
      }

      // 4. Determine the best user-friendly error message
      let errorMessage: string;

      if (error.status === 0) {
        // Network error, CORS issue, or server is completely offline
        errorMessage = translate.instant('COMMON.ERRORS.NETWORK_ERROR');
      } else if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else if (error.status >= 500) {
        // Server-side error (ASP.NET ProblemDetails)
        errorMessage = translate.instant('COMMON.ERRORS.SERVER_ERROR');
      } else {
        // Other HTTP errors (e.g., 403, 404)
        const fallbackMessage = problem?.detail ?? problem?.title ?? error.message;

        if (problem?.title) {
          const key = `COMMON.ERRORS.${problem.title}`;
          const translated = translate.instant(key);
          // If ngx-translate returns the key, no translation exists -> use fallback
          errorMessage = translated !== key ? translated : fallbackMessage;
        } else {
          errorMessage = fallbackMessage ?? translate.instant('COMMON.ERRORS.UNEXPECTED_ERROR');
        }
      }

      toast.error(errorMessage);
      console.error(`[API Error] ${error.status}:`, errorMessage);

      return throwError(() => error);
    }),
  );
};
