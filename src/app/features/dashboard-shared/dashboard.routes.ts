import { Route } from '@angular/router';
import { teacherRoutes } from '../teacher/teacher.routes';
import { adminRoutes } from '../admin/admin.routes';
import { assistantRoutes } from '../assistant/assistant.routes';

export const dashboardRoutes: Route[] = [...teacherRoutes, ...adminRoutes, ...assistantRoutes];
