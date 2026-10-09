import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../Services/auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return toObservable(auth.isAuthChecked).pipe(
    filter((checked) => checked),
    take(1),
    map(() => {
      return auth.isLoggedIn() || router.createUrlTree(['/login']);
    }),
  );
};
