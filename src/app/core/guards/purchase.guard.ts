// guards/purchase.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { LessonService } from '../Services/lesson.service';

export const purchaseGuard: CanActivateFn = (route, state) => {
  const lessonService = inject(LessonService);
  const router = inject(Router);
  const lessonId = route.paramMap.get('id');

  // Check the status of the lesson from your state management or API
  return lessonService.getLessonStatus(lessonId).pipe(
    map((response) => {
      const status = response.status;

      if (status === 0) {
        // Available
        return router.createUrlTree(['/lessons', lessonId, 'details']);
      } else if (status === 1) {
        // Purchased
        return true;
      } else if (status === 2) {
        // Locked
        return router.createUrlTree(['/lessons']);
      } else if (status === 3) {
        // Expired
        return router.createUrlTree(['/lessons', lessonId, 'expired']);
      } else {
        return router.createUrlTree(['/lessons']);
      }
    }),
  );
};
