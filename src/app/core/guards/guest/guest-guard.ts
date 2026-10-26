import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole } from '../../enums/role-enum';
import { AuthService } from '../../services/auth/auth';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  const role = auth.role();

  return role === AppRole.STUDENT
    ? router.createUrlTree(['/my-dashboard'])
    : router.createUrlTree(['/home']);
};
