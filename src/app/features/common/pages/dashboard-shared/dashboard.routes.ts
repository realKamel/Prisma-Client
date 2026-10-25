import { Route } from '@angular/router';
import { adminRoutes } from '../../../admin/admin.routes';
import { assistantRoutes } from '../../../assistant/assistant.routes';
import { teacherRoutes } from '../../../teacher/teacher.routes';
import { chatRoutes } from '../chat/chat.routes';

export const dashboardRoutes: Route[] = [
  ...teacherRoutes,
  ...adminRoutes,
  ...assistantRoutes,
  ...chatRoutes,
];
