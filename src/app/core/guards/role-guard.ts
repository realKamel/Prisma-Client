import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../Services/auth";
import { inject } from "@angular/core";

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data['roles'] ?? [];
  const userRole = auth.role();

  console.log('requiredRoles:', requiredRoles);
  console.log('userRole:', userRole);

  return userRole && requiredRoles.includes(userRole)
    ? true
    : router.createUrlTree(['/']);
};
