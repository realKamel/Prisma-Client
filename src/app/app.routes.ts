import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest-guard';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // ── Main Layout (Public + Student) ─────────────
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      // Public
      {path: '', redirectTo: 'landing-page', pathMatch: 'full' },
      {
        path: 'landing-page',
        loadComponent: () =>
          import('./Pages/public/landing-page/landing-page').then((m) => m.LandingPage),
      },
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./Pages/public/contact-us/contact-us').then((m) => m.ContactUs),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./Pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./Pages/auth/register/register').then((m) => m.RegisterComponent),
      },

      // Student (protected by authGuard + roleGuard)
      {
        path: 'home',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['student'] },
        loadComponent: () => import('./Pages/student/home/home').then((m) => m.Home),
      },

      {
        path: 'courses',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['student'] },
        loadComponent: () => import('./Pages/student/courses/courses').then((m) => m.Courses),
      },
      {
        path: 'quizzes',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['student'] },
        loadComponent: () => import('./Pages/student/quizzes/quizzes').then((m) => m.Quizzes),
      },
      {
        path: 'profile',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['student'] },
        loadComponent: () => import('./Pages/student/profile/profile').then((m) => m.Profile),
      },
    ],
  },

  // ── Dashboard Layout (Admin / Teacher / Assistant) ──
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'teacher', 'assistant'] },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {path: 'overview', loadComponent: () => import('./Pages/dashboard-shared/overview/overview').then((m) => m.Overview) },


      // Admin
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./Pages/admin/users/users').then((m) => m.Users),
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./Pages/admin/settings/settings').then((m) => m.Settings),
      },

      // Teacher
      {
        path: 'my-courses',
        canActivate: [roleGuard],
        data: { roles: ['teacher'] },
        loadComponent: () =>
          import('./Pages/teacher/my-courses/my-courses').then((m) => m.MyCourses),
      },

      // Assistant
      {
        path: 'support',
        canActivate: [roleGuard],
        data: { roles: ['assistant', 'admin'] },
        loadComponent: () => import('./Pages/assistant/support/support').then((m) => m.Support),
      },
    ],
  },

  // ── Fallback ────────────────────────────────────
  { path: '**', redirectTo: '' },
];
