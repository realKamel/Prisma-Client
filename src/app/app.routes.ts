import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';
import { AppRole } from './core/enums/role-enum';

export const routes: Routes = [
  //Main Layout (Public + Student)
  {
    path: '',
    loadChildren: () => import('./features/common/common.routes').then((r) => r.commonRoutes),
  },

  //Dashboard Layout (Admin / Teacher / Assistant)
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.ADMIN, AppRole.TEACHER, AppRole.ASSISTANT] },
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
    loadChildren: () =>
      import('./features/dashboard-shared/dashboard.routes').then((r) => r.dashboardRoutes),
  },

  //Fallback
  {
    path: '**',
    title: 'TITLES.NOT_FOUND',
    loadComponent: () =>
      import('./features/common/pages/not-found/not-found').then((m) => m.NotFound),
  },
];
