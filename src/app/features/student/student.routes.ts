import { Route } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { roleGuard } from '../../core/guards/role-guard';
import { AppRole } from '../../core/enums/role-enum';
import { LessonStatusGuard } from '../../core/guards/lesson-status-guard';

export const studentRoutes: Route[] = [
  {
    path: 'home',
    redirectTo: 'my-dashboard',
    pathMatch: 'full',
  },
  {
    path: 'my-dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.STUDENT_DASHBOARD',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.DashboardPageComponent),
  },
  {
    path: 'lessons',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.STUDENT_LESSONS',
    loadComponent: () => import('./pages/lessons/lessons').then((m) => m.LessonsComponent),
  },
  {
    path: 'teachers/:id/lessons',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.STUDENT.TEACHER_LESSONS',
    loadComponent: () =>
      import('./pages/teacher-lessons/teacher-lessons').then((x) => x.TeacherLessonsComponent),
  },
  {
    path: 'lessons/:id/details',
    canActivate: [authGuard, roleGuard, LessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
    title: 'TITLES.LESSON_DETAILS',
    loadComponent: () =>
      import('./pages/lessons/lesson-detail/lesson-detail').then((m) => m.LessonDetailComponent),
  },
  {
    path: 'lessons/:id/watch',
    canActivate: [authGuard, roleGuard, LessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: '1' },
    title: 'TITLES.WATCH_LESSON',
    loadComponent: () =>
      import('./pages/lessons/lesson-player/lesson-player').then((m) => m.LessonPlayer),
  },
  {
    path: 'lessons/:id/checkout',
    canActivate: [authGuard, roleGuard, LessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
    title: 'TITLES.CHECKOUT',
    loadComponent: () =>
      import('./pages/lessons/checkout-page/checkout-page').then((m) => m.CheckoutPageComponent),
  },
  {
    path: 'lessons/:id/checkout/card',
    canActivate: [authGuard, roleGuard, LessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
    title: 'TITLES.PAYMENT_CARD',
    loadComponent: () =>
      import('./pages/lessons/checkout-page/component/checkout-card-component/checkout-card-component').then(
        (m) => m.CheckoutCardComponent,
      ),
  },
  {
    path: 'lessons/:id/redeem',
    canActivate: [authGuard, roleGuard, LessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
    title: 'TITLES.REDEEM_CODE',
    loadComponent: () =>
      import('./pages/lessons/redeem-code/redeem-code').then((m) => m.RedeemCode),
  },
  {
    path: 'lessons/:id/expired',
    canActivate: [authGuard, roleGuard, LessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: '3' },
    title: 'TITLES.LESSON_EXPIRED',
    loadComponent: () =>
      import('./pages/lessons/lesson-expired/lesson-expired').then((m) => m.LessonExpiredComponent),
  },
  {
    path: 'quizzes',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.QUIZZES',
    loadComponent: () =>
      import('./pages/quizzes/quizzes-list/quizzes-list').then((m) => m.QuizzesList),
  },
  {
    path: 'quizzes/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.QUIZ_DETAIL',
    loadComponent: () =>
      import('./pages/quizzes/quiz-detail/quiz-detail').then((m) => m.QuizDetailComponent),
  },
  {
    path: 'payment/callback',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.PAYMENT_CALLBACK',
    loadComponent: () =>
      import('./pages/lessons/checkout-page/component/payment-callback/payment-callback').then(
        (m) => m.PaymentCallback,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.USER_PROFILE',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'history',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.HISTORY',
    loadComponent: () => import('./pages/history-page/history-page').then((m) => m.HistoryPage),
  },
  {
    path: 'subscriptions',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.SUBSCRIPTIONS',
    loadComponent: () =>
      import('./pages/payment-history/payment-history-page-component').then(
        (m) => m.PaymentHistoryPageComponent,
      ),
  },
];
