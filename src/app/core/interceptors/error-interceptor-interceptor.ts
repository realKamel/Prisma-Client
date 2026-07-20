import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { catchError, throwError } from 'rxjs';

export const errorInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 and 403 are handled by cookieAuthInterceptor — don't toast here
      if (error.status === 401 || error.status === 403) {
        return throwError(() => error);
      }

      let errorMessage = 'An unknown error occurred!';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = error.error.message;
      } else {
        // Server-side error — safely extract message
        errorMessage =
          error.error?.message ?? // your ApiResponse message
          error.error?.title ?? // ASP.NET ProblemDetails
          error.message ?? // HttpErrorResponse fallback
          'An unknown error occurred!';
      }

      toast.error(errorMessage);
      console.error(errorMessage);

      return throwError(() => error); // rethrow original, not new Error()
    }),
  );
};
