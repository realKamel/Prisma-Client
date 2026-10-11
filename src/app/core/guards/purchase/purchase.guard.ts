import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { LessonService } from '../../Services/lesson.service';

export const purchaseGuard: CanActivateFn = (route) => {
  const lessonService = inject(LessonService);
  const router = inject(Router);
  const lessonId = route.paramMap.get('id') as string | number;

  // Check the status of the lesson from your state management or API
  return lessonService.getLessonStatus(lessonId).pipe(
    map((response) => {
      const status = response.status;

      if (status === 'available') {
        // Available
        return router.createUrlTree(['/lessons', lessonId, 'details']);
      } else if (status === 'active') {
        // Purchased
        return true;
      } else if (status === 'locked') {
        // Locked
        return router.createUrlTree(['/lessons']);
      } else if (status === 'expired') {
        // Expired
        return router.createUrlTree(['/lessons', lessonId, 'expired']);
      } else {
        return router.createUrlTree(['/lessons']);
      }
    }),
  );
};
