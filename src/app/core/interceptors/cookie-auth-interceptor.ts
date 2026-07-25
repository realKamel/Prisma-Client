import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../Services/auth';
import { toast } from 'ngx-sonner';
const AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/register'];
export const cookieAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const isAuthRequest = AUTH_URLS.some((url) => req.url.includes(url));

  const reqWithCookie = req.clone({ withCredentials: true });

  // Auth requests: Just pass through with cookies without handling
  if (isAuthRequest) {
    return next(reqWithCookie);
  }

  // Non-auth requests: Pass with cookies And handle 401 errors
  return next(reqWithCookie).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(reqWithCookie, next, authService);
      }
      return throwError(() => error);
    }),
  );
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
) {
  if (!authService.isRefreshing()) {
    authService.isRefreshing.set(true);
    // authService.refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(() => {
        authService.isRefreshing.set(false);
        authService.refreshTokenSubject.next(true);
        return next(request);
      }),
      catchError((error) => {
        authService.isRefreshing.set(false);
        authService.refreshTokenSubject.next(false);
        authService['authStore'].clearAuth(); //only clear state
        return throwError(() => error);
      }),
    );
  }

  // Queue: wait for ongoing refresh to complete
  return authService.refreshTokenSubject.pipe(
    take(1), // Subject won't emit until refresh completes
    switchMap((status) => {
      if (status) {
        return next(request);
      }
      toast.error('Please log in again.');
      return throwError(
        () => new HttpErrorResponse({ status: 401, statusText: 'Session Expired' }),
      );
    }),
  );
}
