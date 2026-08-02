import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AssignmentSubmissionDetail,
  AssignmentSubmissionsResponse,
  GradeSubmissionRequest,
} from '../Models/Teacher/assignment-model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Service()
export class AssignmentService {
  private readonly http = inject(HttpClient);

  getAssignmentSubmissions(
    page = 1,
    search?: string,
    lessonId?: number,
    status?: string,
  ): Observable<AssignmentSubmissionsResponse> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', '20');

    if (search?.trim()) params = params.set('search', search.trim());
    if (lessonId) params = params.set('lessonId', lessonId.toString());
    if (status && status !== 'all') params = params.set('status', status);

    return this.http.get<AssignmentSubmissionsResponse>(
      `${environment.apiUrl}/teacher/assignments`,
      { params },
    );
  }

  getAssignmentDetail(submissionId: number): Observable<AssignmentSubmissionDetail> {
    return this.http.get<AssignmentSubmissionDetail>(
      `${environment.apiUrl}/teacher/assignments/${submissionId}`,
    );
  }

  gradeAssignment(submissionId: number, payload: GradeSubmissionRequest): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/teacher/assignments/${submissionId}/grade`,
      payload,
    );
  }

  releaseAssignmentLock(submissionId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/teacher/assignments/${submissionId}/release-lock`,
      {},
    );
  }
}
