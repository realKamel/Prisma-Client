import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth';
import { inject } from '@angular/core';
import { AppRole } from '../enums/role-enum';
interface RouteData {
  roles?: AppRole[];
}

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: AppRole[] = (route.data as RouteData).roles ?? [];

  if (requiredRoles.length === 0) {
    return true;
  }

  const userRole = auth.role()?.toLowerCase() ?? '';

  if (!userRole) {
    return router.createUrlTree(['/login']);
  }

  const hasRole = requiredRoles.map((r) => r.toLowerCase()).includes(userRole);

  if (hasRole) return true;

  // Smart redirect based on actual role
  if (userRole === AppRole.STUDENT) {
    return router.createUrlTree(['/home']);
  } else if ([AppRole.TEACHER, AppRole.ADMIN, AppRole.ASSISTANT].includes(userRole as AppRole)) {
    return router.createUrlTree(['/dashboard']);
  }

  return router.createUrlTree(['/']);
};
