import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest-guard';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';
import { LessonStatusGuard } from './core/guards/lesson-status-guard';
import { AppRole } from './core/enums/role-enum';
import { PolicyEnum } from './Pages/teacher/my-assistants/assistants.model';
import { policyGuard } from './core/guards/policy-guard';

export const routes: Routes = [
  // ── Main Layout (Public + Student) ─────────────
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      // Public
      {
        path: '',
        canActivate: [guestGuard],
        title: 'TITLES.HOME',
        loadComponent: () =>
          import('./Pages/public/landing-page/landing-page').then((m) => m.LandingPage),
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
          import('./Pages/public/contact-us/contact-us').then((m) => m.ContactUsComponent),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        title: 'TITLES.LOGIN',
        loadComponent: () => import('./Pages/auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        title: 'TITLES.REGISTER',
        loadComponent: () =>
          import('./Pages/auth/register/register').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        title: 'TITLES.FORGOT_PASSWORD',
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
        title: 'TITLES.STUDENT_DASHBOARD',
        loadComponent: () => import('./Pages/student/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'lessons',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        title: 'TITLES.STUDENT_LESSONS',
        loadComponent: () =>
          import('./Pages/student/lessons/lessons').then((m) => m.LessonsComponent),
      },
      {
        path: 'lessons/:id/details',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
        title: 'TITLES.LESSON_DETAILS',
        loadComponent: () =>
          import('./Pages/student/lessons/lesson-detail/lesson-detail').then(
            (m) => m.LessonDetailComponent,
          ),
      },
      {
        path: 'lessons/:id/watch',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '1' },
        title: 'TITLES.WATCH_LESSON',
        loadComponent: () =>
          import('./Pages/student/lessons/lesson-player/lesson-player').then((m) => m.LessonPlayer),
      },
      {
        path: 'lessons/:id/checkout',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
        title: 'TITLES.CHECKOUT',
        loadComponent: () =>
          import('./Pages/student/lessons/checkout-page/checkout-page').then(
            (m) => m.CheckoutPageComponent,
          ),
      },
      {
        path: 'lessons/:id/checkout/card',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
        title: 'TITLES.PAYMENT_CARD',
        loadComponent: () =>
          import('./Pages/student/lessons/checkout-page/component/checkout-card-component/checkout-card-component').then(
            (m) => m.CheckoutCardComponent,
          ),
      },
      {
        path: 'lessons/:id/redeem',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '0' },
        title: 'TITLES.REDEEM_CODE',
        loadComponent: () =>
          import('./Pages/student/lessons/redeem-code/redeem-code').then((m) => m.RedeemCode),
      },
      {
        path: 'lessons/:id/expired',
        canActivate: [authGuard, roleGuard, LessonStatusGuard],
        data: { roles: [AppRole.STUDENT], expectedStatus: '3' },
        title: 'TITLES.LESSON_EXPIRED',
        loadComponent: () =>
          import('./Pages/student/lessons/lesson-expired/lesson-expired').then(
            (m) => m.LessonExpiredComponent,
          ),
      },
      {
        path: 'quizzes',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        title: 'TITLES.QUIZZES',
        loadComponent: () =>
          import('./Pages/student/quizzes/quizzes-list/quizzes-list').then((m) => m.QuizzesList),
      },
      {
        path: 'quizzes/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        title: 'TITLES.QUIZ_DETAIL',
        loadComponent: () =>
          import('./Pages/student/quizzes/quiz-detail/quiz-detail').then(
            (m) => m.QuizDetailComponent,
          ),
      },
      {
        path: 'payment/callback',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        title: 'TITLES.PAYMENT_CALLBACK',
        loadComponent: () =>
          import('./Pages/student/lessons/checkout-page/component/payment-callback/payment-callback').then(
            (m) => m.PaymentCallback,
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        title: 'TITLES.USER_PROFILE',
        loadComponent: () =>
          import('./Pages/student/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'history',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        title: 'TITLES.HISTORY',
        loadComponent: () =>
          import('./Pages/student/history-page/history-page').then((m) => m.HistoryPage),
      },
      {
        path: 'subscriptions',
        canActivate: [authGuard, roleGuard],
        data: { roles: [AppRole.STUDENT] },
        title: 'TITLES.SUBSCRIPTIONS',
        loadComponent: () =>
          import('./Pages/student/payment-history-page-component/payment-history-page-component').then(
            (m) => m.PaymentHistoryPageComponent,
          ),
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
      {
        path: '',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        title: 'TITLES.TEACHER_DASHBOARD',
        loadComponent: () =>
          import('./Pages/teacher/teacher-dashboard/teacher-dashboard').then(
            (m) => m.TeacherDashboardComponent,
          ),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ADMIN] },
        title: 'TITLES.MANAGE_USERS',
        loadComponent: () => import('./Pages/admin/users/users').then((m) => m.UsersComponent),
      },
      {
        path: 'users/add',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ADMIN] },
        title: 'TITLES.ADD_USER',
        loadComponent: () =>
          import('./Pages/admin/users/user-form/user-form').then((m) => m.UserFormComponent),
      },
      {
        path: 'users/edit/:id',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ADMIN] },
        title: 'TITLES.EDIT_USER',
        loadComponent: () =>
          import('./Pages/admin/users/user-form/user-form').then((m) => m.UserFormComponent),
      },
      {
        path: 'users/profile/:id',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ADMIN] },
        title: 'TITLES.ADMIN_USER_PROFILE',
        loadComponent: () =>
          import('./Pages/admin/users/user-profile/user-profile').then(
            (m) => m.UserProfileComponent,
          ),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ADMIN] },
        title: 'TITLES.ADMIN_DASHBOARD',
        loadComponent: () =>
          import('./Pages/admin/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
      },

      // Teacher
      {
        path: 'my-courses',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        title: 'TITLES.MY_COURSES',
        loadComponent: () =>
          import('./Pages/teacher/my-courses/my-courses').then((m) => m.MyCourses),
      },
      {
        path: 'mylessons',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
        title: 'TITLES.MY_LESSONS',
        loadComponent: () =>
          import('./Pages/teacher/teacher-lessons/teacher-lessons-component').then(
            (m) => m.TeacherLessonsComponent,
          ),
      },
      {
        path: 'mylessons/:lessonId/edit',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
        title: 'TITLES.EDIT_LESSON',
        loadComponent: () =>
          import('./Pages/teacher/lesson-editor-page-component/lesson-editor-page-component').then(
            (m) => m.LessonEditorPageComponent,
          ),
      },
      {
        path: 'mylessons/add',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
        title: 'TITLES.ADD_LESSON',
        loadComponent: () =>
          import('./Pages/teacher/add-lesson-component/add-lesson-component').then(
            (m) => m.AddLessonComponent,
          ),
      },
      {
        path: 'mylessons/upload-materials',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
        title: 'TITLES.UPLOAD_MATERIALS',
        loadComponent: () =>
          import('./Pages/teacher/upload-materials-component/upload-materials-component').then(
            (m) => m.LessonUploadPageComponent,
          ),
      },
      {
        path: 'myexams',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanEvaluateStudents],
        },
        title: 'TITLES.MY_EXAMS',
        loadComponent: () =>
          import('./Pages/teacher/teacher-exams/teacher-exams').then(
            (m) => m.TeacherExamsComponent,
          ),
      },
      {
        path: 'myfinances',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
        title: 'TITLES.MY_FINANCES',
        loadComponent: () =>
          import('./Pages/teacher/finances-page-component/finances-page.component').then(
            (m) => m.FinancesPageComponent,
          ),
      },
      {
        path: 'mystudents',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanManageEnrollments],
        },
        title: 'TITLES.MY_STUDENTS',
        loadComponent: () =>
          import('./Pages/teacher/teacher-students/teacher-students').then(
            (m) => m.TeacherStudents,
          ),
      },
      {
        path: 'mypreference',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
        title: 'TITLES.MY_PREFERENCES',
        loadComponent: () =>
          import('./Pages/teacher/teacher-preference/teacher-preference').then(
            (m) => m.TeacherPreferenceComponent,
          ),
      },
      {
        path: 'mycodes',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanManageEnrollments],
        },
        title: 'TITLES.MY_CODES',
        loadComponent: () =>
          import('./Pages/teacher/teacher-code/teacher-codes').then((m) => m.TeacherCodesComponent),
      },
      {
        path: 'mycodes/generate-codes',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanManageEnrollments],
        },
        title: 'TITLES.GENERATE_CODES',
        loadComponent: () =>
          import('./Pages/teacher/teacher-code/generate-codes/generate-codes').then(
            (m) => m.GenerateCodesComponent,
          ),
      },
      {
        path: 'mycodes/codes-batch/:id',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanManageEnrollments],
        },
        title: 'TITLES.CODES_BATCH',
        loadComponent: () =>
          import('./Pages/teacher/teacher-code/code-batch/codes-batch').then(
            (m) => m.CodesBatchComponent,
          ),
      },
      {
        path: 'mystudents/add',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanManageEnrollments],
        },
        title: 'TITLES.ADD_STUDENT',
        loadComponent: () =>
          import('./Pages/teacher/teacher-students/teacher-student-form/student-form').then(
            (m) => m.StudentForm,
          ),
      },
      {
        path: 'mystudents/edit/:id',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanManageEnrollments],
        },
        title: 'TITLES.EDIT_STUDENT',
        loadComponent: () =>
          import('./Pages/teacher/teacher-students/teacher-student-form/student-form').then(
            (m) => m.StudentForm,
          ),
      },
      {
        path: 'mystudents/grant',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanManageEnrollments],
        },
        title: 'TITLES.GRANT_LESSON',
        loadComponent: () =>
          import('./Pages/teacher/teacher-students/teacher-grant-lesson/grant-lesson').then(
            (m) => m.GrantLesson,
          ),
      },
      {
        path: 'mystudents/report',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanViewReports],
        },
        title: 'TITLES.SEND_REPORT',
        loadComponent: () =>
          import('./Pages/teacher/teacher-students/teacher-send-report/send-report').then(
            (m) => m.SendReport,
          ),
      },
      // MUST be LAST among mystudents routes
      {
        path: 'mystudents/:id',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.TEACHER, AppRole.ASSISTANT],
          policies: [PolicyEnum.CanManageEnrollments],
        },
        title: 'TITLES.STUDENT_PROFILE_DETAIL',
        loadComponent: () =>
          import('./Pages/teacher/teacher-students/teacher-student-profile/student-profile').then(
            (m) => m.StudentProfile,
          ),
      },
      // Teacher
      {
        path: 'my-assistants',
        canActivate: [roleGuard],
        data: { roles: [AppRole.TEACHER] },
        title: 'TITLES.MY_ASSISTANTS',
        loadComponent: () =>
          import('./Pages/teacher/my-assistants/my-assistants').then((m) => m.MyAssistants),
      },
      // Assistant
      {
        path: 'support',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ASSISTANT, AppRole.ADMIN] },
        title: 'TITLES.SUPPORT_TICKETS',
        loadComponent: () => import('./Pages/assistant/support/support').then((m) => m.Support),
      },
      {
        path: 'assistant',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ASSISTANT, AppRole.ADMIN] },
        title: 'TITLES.ASSISTANT_DASHBOARD',
        loadComponent: () =>
          import('./Pages/assistant/assistant-dashboard-component/assistant-dashboard-component').then(
            (m) => m.AssistantDashboardComponent,
          ),
      },
      {
        path: 'lessons',
        canActivate: [roleGuard, policyGuard],
        data: {
          roles: [AppRole.ASSISTANT, AppRole.ADMIN],
          policies: [PolicyEnum.CanManageContent],
        },
        title: 'TITLES.ASSISTANT_LESSONS',
        loadComponent: () =>
          import('./Pages/assistant/lessons-page.component/lessons-page.component').then(
            (m) => m.LessonsPageComponent,
          ),
      },
      {
        path: 'activity-log',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ADMIN] },
        title: 'TITLES.SYSTEM_ACTIVITY_LOG',
        loadComponent: () =>
          import('./Pages/admin/activity-log.component/activity-log.component').then(
            (m) => m.ActivityLogComponent,
          ),
      },
      {
        path: 'lessons/add',
        canActivate: [roleGuard, policyGuard],
        data: { roles: [AppRole.ASSISTANT], policies: [PolicyEnum.CanManageContent] },
        title: 'TITLES.ASSISTANT_ADD_LESSON',
        loadComponent: () =>
          import('./Pages/teacher/add-lesson-component/add-lesson-component').then(
            (m) => m.AddLessonComponent,
          ),
      },
      {
        path: 'lessons/upload-materials',
        canActivate: [roleGuard, policyGuard],
        data: { roles: [AppRole.ASSISTANT], policies: [PolicyEnum.CanManageContent] },
        title: 'TITLES.ASSISTANT_UPLOAD_MATERIALS',
        loadComponent: () =>
          import('./Pages/teacher/upload-materials-component/upload-materials-component').then(
            (m) => m.LessonUploadPageComponent,
          ),
      },
      {
        path: 'lessons/:lessonId/edit',
        canActivate: [roleGuard, policyGuard],
        data: { roles: [AppRole.ASSISTANT], policies: [PolicyEnum.CanManageContent] },
        title: 'TITLES.ASSISTANT_EDIT_LESSON',
        loadComponent: () =>
          import('./Pages/teacher/lesson-editor-page-component/lesson-editor-page-component').then(
            (m) => m.LessonEditorPageComponent,
          ),
      },
      {
        path: 'myactivity-log',
        canActivate: [roleGuard],
        data: { roles: [AppRole.ASSISTANT] },
        title: 'TITLES.MY_ACTIVITY_LOG',
        loadComponent: () =>
          import('./Pages/assistant/log-page-component/log-page-component').then(
            (m) => m.LogPageComponent,
          ),
      },
      {
        path: '**',
        title: 'TITLES.NOT_FOUND',
        loadComponent: () => import('./Pages/public/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },

  // ── Fallback ────────────────────────────────────
  {
    path: '**',
    title: 'TITLES.NOT_FOUND',
    loadComponent: () => import('./Pages/public/not-found/not-found').then((m) => m.NotFound),
  },
];
