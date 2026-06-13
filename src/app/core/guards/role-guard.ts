import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data['roles'] ?? [];
  const userRole = auth.role()?.toLowerCase() ?? '';  

  const hasRole = requiredRoles
    .map(r => r.toLowerCase())                      
    .includes(userRole);

  return hasRole ? true : router.createUrlTree(['/']);
};