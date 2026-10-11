import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Services/auth';
import { AppRole } from '../../enums/role-enum';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  const role = auth.role();

  return role === AppRole.STUDENT
    ? router.createUrlTree(['/my-dashboard'])
    : router.createUrlTree(['/home']);
};
