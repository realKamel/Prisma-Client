import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivityLogResponse, ApiActivityLogResponseDto } from '../Models/Admin/activity-log.model';
import { environment } from '../../../environments/environment';
import { mapActivityLogResponse } from '../Models/Admin/activity-log.mapper';
import { ApiResponse } from '../Models/ApiResponse';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {

  private readonly endpoint = `${environment.apiUrl}/Admin/activity-logs`;

  constructor(private readonly http: HttpClient) {}

  getActivityLog(skip: number = 0, take: number = 20): Observable<ActivityLogResponse> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('take', take);

    return this.http
      .get<ApiResponse<ApiActivityLogResponseDto>>(this.endpoint, { params })
      .pipe(
        map(response => {
          if (!response.succeeded || !response.data) {
            // ترجع شكل آمن بدل ما ينهار الـ mapper على null
            return { stats: null, events: [], hasMore: false } as ActivityLogResponse;
          }
          return mapActivityLogResponse(response.data);
        }),
      );
  }
}