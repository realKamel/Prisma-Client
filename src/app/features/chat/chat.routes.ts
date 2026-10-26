import { Route } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guard';

/**
 * Messenger routes. Registered twice on purpose: students reach them at
 * `/messages` (main layout) while staff use `/dashboard/messages`.
 */
export const chatRoutes: Route[] = [
  {
    path: 'messages',
    canActivate: [authGuard],
    title: 'TITLES.MESSAGES',
    loadComponent: () =>
      import('./pages/messages-page/messages-page').then((m) => m.MessagesPageComponent),
  },
];
