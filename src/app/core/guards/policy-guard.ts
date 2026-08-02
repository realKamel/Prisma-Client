import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';
import { AuthService } from '../Services/auth';
import { PolicyRouteData } from '../Models/route-data.model';
import { PolicyEnum } from '../../features/teacher/pages/my-assistants/assistants.model';

export const policyGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredPolicies: PolicyEnum[] = (route.data as PolicyRouteData).policies ?? [];

  if (requiredPolicies.length === 0) {
    return true;
  }

  const userRole = auth.role()?.toLowerCase() ?? '';

  // Policies only ever apply to assistants — teachers/admins implicitly have full access
  if (userRole !== 'assistant') {
    return true;
  }

  const userPermissions = authStore.user()?.permissions ?? [];

  const hasAllRequired = requiredPolicies.every((p) => userPermissions.includes(p));

  if (hasAllRequired) return true;

  // Assistant is missing a required policy — send them to their own dashboard
  return router.createUrlTree(['/dashboard/assistant']);
};
