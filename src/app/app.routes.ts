import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest-guard';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';
import { LessonStatusGuard } from './core/guards/lesson-status-guard';
import { AppRole } from './core/enums/role-enum';
import { MyAssistants } from './Pages/teacher/my-assistants/my-assistants';

export const routes: Routes = [
  // ── Main Layout (Public + Student) ─────────────
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      // Public
      {
        path: '',
        loadComponent: () =>
          import('./Pages/public/landing-page/landing-page').then((m) => m.LandingPage),
      },
      { path: 'landing-page', redirectTo: '', pathMatch: 'full' },
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./Pages/public/contact-us/contact-us').then((m) => m.ContactUsComponent),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./Pages/auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./Pages/auth/register/register').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./Pages/auth/forgot-password/forgot-password').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },

      // ── Student Routes ──
      {
        path: 'home',
        redirectTo: 'my-dashboard',
        pathMatch: 'full',
      },
      {
        path: 'my-dashboard',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        loadComponent: () => import('./Pages/student/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'lessons',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        loadComponent: () =>
          import('./Pages/student/lessons/lessons').then((m) => m.LessonsComponent),
      },
      {
        path: 'lessons/:id/details',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
        loadComponent: () =>
          import('./Pages/student/lessons/lesson-detail/lesson-detail').then(
            (m) => m.LessonDetailComponent,
          ),
      },
      {
        path: 'lessons/:id/watch',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '1' },
        loadComponent: () =>
          import('./Pages/student/lessons/lesson-player/lesson-player').then((m) => m.LessonPlayer),
      },
      {
        path: 'lessons/:id/checkout',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
        loadComponent: () =>
          import('./Pages/student/lessons/checkout-page/checkout-page').then(
            (m) => m.CheckoutPageComponent,
          ),
      },
      {
        path: 'lessons/:id/checkout/fawry',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
        loadComponent: () =>
          import('./Pages/student/lessons/checkout-page/component/checkout-fawry-component/checkout-fawry-component').then(
            (m) => m.CheckoutFawryComponent,
          ),
      },
      {
        path: 'lessons/:id/checkout/card',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
        loadComponent: () =>
          import('./Pages/student/lessons/checkout-page/component/checkout-card-component/checkout-card-component').then(
            (m) => m.CheckoutCardComponent,
          ),
      },
      {
        path: 'lessons/:id/redeem',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
        loadComponent: () =>
          import('./Pages/student/lessons/redeem-code/redeem-code').then((m) => m.RedeemCode),
      },
      {
        path: 'lessons/:id/expired',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '3' },
        loadComponent: () =>
          import('./Pages/student/lessons/lesson-expired/lesson-expired').then(
            (m) => m.LessonExpiredComponent,
          ),
      },
      {
        path: 'quizzes',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        loadComponent: () =>
          import('./Pages/student/quizzes/quizzes-list/quizzes-list').then((m) => m.QuizzesList),
      },
      {
        path: 'quizzes/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        loadComponent: () =>
          import('./Pages/student/quizzes/quiz-detail/quiz-detail').then(
            (m) => m.QuizDetailComponent,
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        loadComponent: () => import('./Pages/student/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'history',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        loadComponent: () =>
          import('./Pages/student/history-page/history-page').then((m) => m.HistoryPage),
      },
    ],
  },

  // ── Dashboard Layout (Admin / Teacher / Assistant) ──
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.ADMIN, AppRole.TEACHER, AppRole.ASSISTANT] },
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayout),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      // {
      //   path: 'overview',
      //   loadComponent: () =>
      //     import('./Pages/dashboard-shared/overview/overview').then((m) => m.Overview),
      // },
      // Admin
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ADMIN] },
        loadComponent: () => import('./Pages/admin/users/users').then((m) => m.Users),
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ADMIN] },
        loadComponent: () => import('./Pages/admin/settings/settings').then((m) => m.Settings),
      },
      // Teacher
      {
        path: 'my-courses',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        loadComponent: () =>
          import('./Pages/teacher/my-courses/my-courses').then((m) => m.MyCourses),
      },
      {
        path: 'mylessons',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        loadComponent: () =>
          import('./Pages/teacher/teacher-lessons/teacher-lessons-component').then(
            (m) => m.TeacherLessonsComponent,
          ),
      },
      {
        path: 'mylessons/:lessonId/edit',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        loadComponent: () =>
          import('./Pages/teacher/lesson-editor-page-component/lesson-editor-page-component').then(
            (m) => m.LessonEditorPageComponent,
          ),
      },
      {
        path: 'mylessons/add',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        loadComponent: () =>
          import('./Pages/teacher/add-lesson-component/add-lesson-component').then(
            (m) => m.AddLessonComponent,
          ),
      },
      {
        path: 'mylessons/upload-materials',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        loadComponent: () =>
          import('./Pages/teacher/upload-materials-component/upload-materials-component').then(
            (m) => m.LessonUploadPageComponent,
          ),
      },
      {
        path: 'myexams',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        loadComponent: () =>
          import('./Pages/teacher/teacher-exams/teacher-exams').then(
            (m) => m.TeacherExamsComponent,
          ),
      },
      // FIXME:the component file is mission
      // {
      //   path: 'mystudents',
      //   canActivate: [roleGuard],
      //   data: { roles: [AppRole.TEACHER] },
      //   loadComponent: () =>
      //     import('./Pages/teacher/teacher-students/teacher-students').then(
      //       (m) => m.TeacherStudentsComponent,
      //     ),
      // },
      // Teacher
      {
        path: '',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        loadComponent: () =>
          import('./Pages/teacher/teacher-dashboard/teacher-dashboard').then(
            (m) => m.TeacherDashboardComponent,
          ),
      },
      {
        path: 'my-assistants',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        loadComponent: () =>
          import('./Pages/teacher/my-assistants/my-assistants').then((m) => m.MyAssistants),
      },
      // Assistant
      {
        path: 'support',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ASSISTANT, AppRole.ADMIN] },
        loadComponent: () => import('./Pages/assistant/support/support').then((m) => m.Support),
      },
    ],
  },

  // ── Fallback ────────────────────────────────────
  {
    path: '**',
    loadComponent: () => import('./Pages/public/not-found/not-found').then((m) => m.NotFound),
  },
];
