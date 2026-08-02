import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { LessonService } from '../Services/lesson.service';
import { Service, inject } from '@angular/core';
import { LessonStatus } from '../Models/lesson-model';

@Service()
export class LessonStatusGuard implements CanActivate {
  private lessonService = inject(LessonService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const id = route.paramMap.get('id');
    const expectedStatus = route.data['expectedStatus'] as LessonStatus;

    return this.lessonService.getLessonStatus(id).pipe(
      map((response) => {
        const status = response.status;
        if (status == Number(expectedStatus)) return true;

        switch (status) {
          case 0:
            return this.router.createUrlTree(['/lessons', id, 'details']);
          case 1:
            return this.router.createUrlTree(['/lessons', id, 'watch']);
          case 3:
            return this.router.createUrlTree(['/lessons', id, 'expired']);
          default:
            return this.router.createUrlTree(['/lessons']);
        }
      }),
    );
  }
}
