import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { catchError, throwError } from 'rxjs';
import { IProblemDetails } from '../Models/problemDetails';

export const errorInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 and 403 are handled by cookieAuthInterceptor — don't toast here
      if (error.status === 401 || error.status === 403) {
        return throwError(() => error);
      }

      // ASP.NET model-validation responses (400) carry an `errors` dictionary that
      // the consuming form maps onto its controls via applyServerErrors() — don't
      // toast the generic "One or more validation errors occurred." title here.
      const problem =
        error.error instanceof ErrorEvent
          ? undefined
          : (error.error as IProblemDetails | undefined);
      if (error.status === 400 && problem?.errors) {
        return throwError(() => error);
      }

      let errorMessage: string;

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = error.error.message;
      } else {
        // Server-side error — the API returns ASP.NET ProblemDetails
        errorMessage =
          problem?.title ?? // ASP.NET ProblemDetails
          problem?.detail ??
          error.message ?? // HttpErrorResponse fallback
          'An unknown error occurred!';
      }

      toast.error(errorMessage);
      console.error(errorMessage);

      return throwError(() => error); // rethrow original, not new Error()
    }),
  );
};
