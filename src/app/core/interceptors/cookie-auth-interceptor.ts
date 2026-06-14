import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const cookieAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const reqWithCookie = req.clone({ withCredentials: true });
  //TODO:I Will need to handle refresh logic
  return next(reqWithCookie).pipe(
    catchError((error: HttpErrorResponse) => {
      // if (error.status === 401) {
      //   return handle401Error(authReq, next, authService);
      // }
      return throwError(() => error);
    }),
  );
};
