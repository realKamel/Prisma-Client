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

      let errorMessage: string;

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = error.error.message;
      } else {
        // Server-side error — the API returns ASP.NET ProblemDetails
        const problem = error.error as IProblemDetails | undefined;
        errorMessage =
          problem?.detail ??
          problem?.title ?? // ASP.NET ProblemDetails
          error.message ?? // HttpErrorResponse fallback
          'An unknown error occurred!';
      }

      toast.error(errorMessage);
      console.error(errorMessage);

      return throwError(() => error); // rethrow original, not new Error()
    }),
  );
};
