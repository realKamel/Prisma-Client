import { Route } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';
import { policyGuard } from '../../core/guards/policy-guard';
import { AppRole } from '../../core/enums/role-enum';
import { PolicyEnum } from './pages/my-assistants/assistants.model';

export const teacherRoutes: Route[] = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: [AppRole.TEACHER] },
    title: 'TITLES.TEACHER_DASHBOARD',
    loadComponent: () =>
      import('./pages/teacher-dashboard/teacher-dashboard').then(
        (m) => m.TeacherDashboardComponent,
      ),
  },
  {
    path: 'my-courses',
    canActivate: [roleGuard],
    data: { roles: [AppRole.TEACHER] },
    title: 'TITLES.MY_COURSES',
    loadComponent: () => import('./pages/my-courses/my-courses').then((m) => m.MyCourses),
  },
  {
    path: 'mylessons',
    canActivate: [roleGuard],
    data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
    title: 'TITLES.MY_LESSONS',
    loadComponent: () =>
      import('./teacher-lessons/teacher-lessons-component').then((m) => m.TeacherLessonsComponent),
  },
  {
    path: 'mylessons/:lessonId/edit',
    canActivate: [roleGuard],
    data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
    title: 'TITLES.EDIT_LESSON',
    loadComponent: () =>
      import('./lesson-editor-page-component/lesson-editor-page-component').then(
        (m) => m.LessonEditorPageComponent,
      ),
  },
  {
    path: 'mylessons/add',
    canActivate: [roleGuard],
    data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
    title: 'TITLES.ADD_LESSON',
    loadComponent: () =>
      import('./pages/add-lesson/add-lesson-component').then((m) => m.AddLessonComponent),
  },
  {
    path: 'mylessons/upload-materials',
    canActivate: [roleGuard],
    data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
    title: 'TITLES.UPLOAD_MATERIALS',
    loadComponent: () =>
      import('./upload-materials-component/upload-materials-component').then(
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
      import('./teacher-exams/teacher-exams').then((m) => m.TeacherExamsComponent),
  },
  {
    path: 'myfinances',
    canActivate: [roleGuard],
    data: { roles: [AppRole.TEACHER, AppRole.ADMIN] },
    title: 'TITLES.MY_FINANCES',
    loadComponent: () =>
      import('./finances-page-component/finances-page.component').then(
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
      import('./teacher-students/teacher-students').then((m) => m.TeacherStudents),
  },
  {
    path: 'mypreference',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ADMIN] },
    title: 'TITLES.MY_PREFERENCES',
    loadComponent: () =>
      import('./teacher-preference/teacher-preference').then((m) => m.TeacherPreferenceComponent),
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
      import('./teacher-code/teacher-codes').then((m) => m.TeacherCodesComponent),
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
      import('./teacher-code/generate-codes/generate-codes').then((m) => m.GenerateCodesComponent),
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
      import('./teacher-code/code-batch/codes-batch').then((m) => m.CodesBatchComponent),
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
      import('./teacher-students/teacher-student-form/student-form').then((m) => m.StudentForm),
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
      import('./teacher-students/teacher-student-form/student-form').then((m) => m.StudentForm),
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
      import('./teacher-students/teacher-grant-lesson/grant-lesson').then((m) => m.GrantLesson),
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
      import('./teacher-students/teacher-send-report/send-report').then((m) => m.SendReport),
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
      import('./teacher-students/teacher-student-profile/student-profile').then(
        (m) => m.StudentProfile,
      ),
  },
  {
    path: 'my-assistants',
    canActivate: [roleGuard],
    data: { roles: [AppRole.TEACHER] },
    title: 'TITLES.MY_ASSISTANTS',
    loadComponent: () => import('./pages/my-assistants/my-assistants').then((m) => m.MyAssistants),
  },
];
