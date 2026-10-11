import { Route } from '@angular/router';
import { AppRole } from '../../core/enums/role-enum';
import { authGuard } from '../../core/guards/auth/auth-guard';
import { lessonStatusGuard } from '../../core/guards/lesson-status/lesson-status.guard';
import { roleGuard } from '../../core/guards/role/role-guard';

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
    canActivate: [authGuard, roleGuard, lessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: 'available' },
    title: 'TITLES.LESSON_DETAILS',
    loadComponent: () =>
      import('./pages/lessons/lesson-detail/lesson-detail').then((m) => m.LessonDetailComponent),
  },
  {
    path: 'lessons/:id/watch',
    canActivate: [authGuard, roleGuard, lessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: 'active' },
    title: 'TITLES.WATCH_LESSON',
    loadComponent: () =>
      import('./pages/player/lesson-player').then((m) => m.LessonPlayerPageComponent),
  },
  {
    path: 'lessons/:id/checkout',
    canActivate: [authGuard, roleGuard, lessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: 'available' },
    title: 'TITLES.CHECKOUT',
    loadComponent: () =>
      import('./pages/lessons/checkout-page/checkout-page').then((m) => m.CheckoutPageComponent),
  },
  {
    path: 'lessons/:id/checkout/card',
    canActivate: [authGuard, roleGuard, lessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: 'available' },
    title: 'TITLES.PAYMENT_CARD',
    loadComponent: () =>
      import('./pages/lessons/checkout-page/component/checkout-card-component/checkout-card-component').then(
        (m) => m.CheckoutCardComponent,
      ),
  },
  {
    path: 'lessons/:id/redeem',
    canActivate: [authGuard, roleGuard, lessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: 'available' },
    title: 'TITLES.REDEEM_CODE',
    loadComponent: () =>
      import('./pages/lessons/redeem-code/redeem-code').then((m) => m.RedeemCode),
  },
  {
    path: 'lessons/:id/expired',
    canActivate: [authGuard, roleGuard, lessonStatusGuard],
    data: { roles: [AppRole.STUDENT], expectedStatus: 'expired' },
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
      import('./pages/quizzes/quizzes-list/quizzes-list').then((m) => m.QuizzesListPageComponent),
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
      import('./pages/profile/profile.component').then((m) => m.ProfilePageComponent),
  },
  {
    path: 'history',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.STUDENT] },
    title: 'TITLES.HISTORY',
    loadComponent: () =>
      import('./pages/history-page/history-page').then((m) => m.HistoryPageComponent),
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
