import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';

@Service()
export class EnrollmentService {
  private http = inject(HttpClient);

  public MarkLessonAsWatched(enrollmentId: string) {
    return this.http.patch(`${environment.apiUrl}/Enrollments/${enrollmentId}/completed`, null);
  }
}
