import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { StudentEnrollmentStatus } from '../../Models/lesson-model';
import { LessonService } from '../../Services/lesson.service';

export const lessonStatusGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('id') as number | string;
  const lessonService = inject(LessonService);
  const expectedStatus = route.data['expectedStatus'] as StudentEnrollmentStatus;
  const router = inject(Router);
  return lessonService.getLessonStatus(id).pipe(
    map((response) => {
      const status = response.status;
      if (status == expectedStatus) return true;

      switch (status) {
        case 'available':
          return router.createUrlTree(['/lessons', id, 'details']);
        case 'active':
          return router.createUrlTree(['/lessons', id, 'watch']);
        case 'expired':
          return router.createUrlTree(['/lessons', id, 'expired']);
        default:
          return router.createUrlTree(['/lessons']);
      }
    }),
  );
};
