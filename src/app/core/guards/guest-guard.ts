import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth';

export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  const role = auth.role();

  return role === 'student'
    ? router.createUrlTree(['/courses'])
    : router.createUrlTree(['/dashboard']);
};
