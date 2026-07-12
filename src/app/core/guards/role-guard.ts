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
  } else if (userRole === AppRole.TEACHER) {
    return router.createUrlTree(['/dashboard']);
  } else if (userRole === AppRole.ASSISTANT){
    return router.createUrlTree(['/dashboard/assistant']);
  } else if(userRole === AppRole.ADMIN){
    return router.createUrlTree(['/dashboard/admin']);
  }

  return router.createUrlTree(['/']);
};
