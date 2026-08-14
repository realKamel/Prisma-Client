import { Route } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';
import { AppRole } from '../../core/enums/role-enum';

export const adminRoutes: Route[] = [
  {
    path: 'users',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ADMIN] },
    title: 'TITLES.MANAGE_USERS',
    loadComponent: () => import('./users/users').then((m) => m.UsersComponent),
  },
  {
    path: 'users/add',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ADMIN] },
    title: 'TITLES.ADD_USER',
    loadComponent: () => import('./users/user-form/user-form').then((m) => m.UserFormComponent),
  },
  {
    path: 'users/edit/:id',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ADMIN] },
    title: 'TITLES.EDIT_USER',
    loadComponent: () => import('./users/user-form/user-form').then((m) => m.UserFormComponent),
  },
  {
    path: 'users/profile/:id',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ADMIN] },
    title: 'TITLES.ADMIN_USER_PROFILE',
    loadComponent: () =>
      import('./users/user-profile/user-profile').then((m) => m.UserProfileComponent),
  },
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ADMIN] },
    title: 'TITLES.ADMIN_DASHBOARD',
    loadComponent: () => import('./dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'teachers',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ADMIN] },
    title: 'TITLES.TEACHERS',
    loadComponent: () =>
      import('./teachers/teachers-admin-page.component').then((m) => m.TeachersAdminPageComponent),
  },
  {
    path: 'activity-log',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ADMIN] },
    title: 'TITLES.SYSTEM_ACTIVITY_LOG',
    loadComponent: () =>
      import('./activity-log.component/activity-log.component').then((m) => m.ActivityLogComponent),
  },
];
