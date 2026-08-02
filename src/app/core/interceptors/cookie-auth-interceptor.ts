import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, take, throwError } from 'rxjs';
import { AuthStoreService } from '../Services/auth-store.service';
import { toast } from 'ngx-sonner';

const AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/register'];

export const cookieAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStoreService);

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
        return handle401Error(reqWithCookie, next, authStore);
      }
      return throwError(() => error);
    }),
  );
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authStore: AuthStoreService,
) {
  if (!authStore.isRefreshing()) {
    authStore.isRefreshing.set(true);

    return authStore.refreshToken().pipe(
      switchMap(() => {
        authStore.isRefreshing.set(false);
        authStore.refreshTokenSubject.next(true);
        return next(request);
      }),
      catchError((error) => {
        authStore.isRefreshing.set(false);
        authStore.refreshTokenSubject.next(false);
        authStore.clearAuthState(); // only clear local state, no navigation
        return throwError(() => error);
      }),
    );
  }

  // Queue: wait for ongoing refresh to complete
  return authStore.refreshTokenSubject.pipe(
    take(1),
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
