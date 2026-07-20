import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  AssignmentSubmissionDetail,
  AssignmentSubmissionsResponse,
  GradeSubmissionRequest,
} from '../Models/Teacher/assignment-model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../Models/ApiResponse';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly http = inject(HttpClient);

  getAssignmentSubmissions(
    page: number = 1,
    search?: string,
    lessonId?: number,
    status?: string,
  ): Observable<AssignmentSubmissionsResponse> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', '20');

    if (search?.trim()) params = params.set('search', search.trim());
    if (lessonId) params = params.set('lessonId', lessonId.toString());
    if (status && status !== 'all') params = params.set('status', status);

    return this.http
      .get<
        ApiResponse<AssignmentSubmissionsResponse>
      >(`${environment.apiUrl}/teacher/assignments`, { params })
      .pipe(map((res) => res.data!));
  }

  getAssignmentDetail(submissionId: number): Observable<AssignmentSubmissionDetail> {
    return this.http
      .get<
        ApiResponse<AssignmentSubmissionDetail>
      >(`${environment.apiUrl}/teacher/assignments/${submissionId}`)
      .pipe(map((res) => res.data!));
  }

  gradeAssignment(submissionId: number, payload: GradeSubmissionRequest): Observable<void> {
    return this.http
      .post<
        ApiResponse<void>
      >(`${environment.apiUrl}/teacher/assignments/${submissionId}/grade`, payload)
      .pipe(map(() => void 0));
  }

  releaseAssignmentLock(submissionId: number): Observable<void> {
    return this.http
      .post<
        ApiResponse<void>
      >(`${environment.apiUrl}/teacher/assignments/${submissionId}/release-lock`, {})
      .pipe(map(() => void 0));
  }
}
