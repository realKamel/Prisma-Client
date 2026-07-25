import { Route } from '@angular/router';
import { guestGuard } from '../../core/guards/guest-guard';

export const commonRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('../../layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      // ── Public Routes ──
      {
        path: '',
        canActivate: [guestGuard],
        title: 'TITLES.HOME',
        loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.LandingPage),
      },
      {
        path: 'landing-page',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'contact-us',
        canActivate: [guestGuard],
        title: 'TITLES.CONTACT_US',
        loadComponent: () =>
          import('./pages/contact-us/contact-us').then((m) => m.ContactUsComponent),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        title: 'TITLES.LOGIN',
        loadComponent: () => import('../auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        title: 'TITLES.REGISTER',
        loadComponent: () => import('../auth/register/register').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        title: 'TITLES.FORGOT_PASSWORD',
        loadComponent: () =>
          import('../auth/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent),
      },

      // ── Student Routes (lazy-loaded from student feature) ──
      {
        path: '',
        loadChildren: () => import('../student/student.routes').then((m) => m.studentRoutes),
      },
    ],
  },
];
