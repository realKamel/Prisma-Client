import { Route } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';
import { policyGuard } from '../../core/guards/policy-guard';
import { AppRole } from '../../core/enums/role-enum';
import { PolicyEnum } from '../teacher/pages/my-assistants/assistants.model';

export const assistantRoutes: Route[] = [
  {
    path: 'support',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ASSISTANT, AppRole.ADMIN] },
    title: 'TITLES.SUPPORT_TICKETS',
    loadComponent: () => import('./support/support').then((m) => m.Support),
  },
  {
    path: 'assistant',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ASSISTANT, AppRole.ADMIN] },
    title: 'TITLES.ASSISTANT_DASHBOARD',
    loadComponent: () =>
      import('./assistant-dashboard-component/assistant-dashboard-component').then(
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
      import('./lessons-page.component/lessons-page.component').then((m) => m.LessonsPageComponent),
  },
  {
    path: 'lessons/add',
    canActivate: [roleGuard, policyGuard],
    data: { roles: [AppRole.ASSISTANT], policies: [PolicyEnum.CanManageContent] },
    title: 'TITLES.ASSISTANT_ADD_LESSON',
    loadComponent: () =>
      import('../teacher/pages/add-lesson/add-lesson-component').then((m) => m.AddLessonComponent),
  },
  {
    path: 'lessons/upload-materials',
    canActivate: [roleGuard, policyGuard],
    data: { roles: [AppRole.ASSISTANT], policies: [PolicyEnum.CanManageContent] },
    title: 'TITLES.ASSISTANT_UPLOAD_MATERIALS',
    loadComponent: () =>
      import('../teacher/upload-materials-component/upload-materials-component').then(
        (m) => m.LessonUploadPageComponent,
      ),
  },
  {
    path: 'lessons/:lessonId/edit',
    canActivate: [roleGuard, policyGuard],
    data: { roles: [AppRole.ASSISTANT], policies: [PolicyEnum.CanManageContent] },
    title: 'TITLES.ASSISTANT_EDIT_LESSON',
    loadComponent: () =>
      import('../teacher/lesson-editor-page-component/lesson-editor-page-component').then(
        (m) => m.LessonEditorPageComponent,
      ),
  },
  {
    path: 'myactivity-log',
    canActivate: [roleGuard],
    data: { roles: [AppRole.ASSISTANT] },
    title: 'TITLES.MY_ACTIVITY_LOG',
    loadComponent: () =>
      import('./log-page-component/log-page-component').then((m) => m.LogPageComponent),
  },
];
