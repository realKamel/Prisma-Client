import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

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
