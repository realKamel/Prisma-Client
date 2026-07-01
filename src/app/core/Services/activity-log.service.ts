import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivityLogResponse, ApiActivityLogResponseDto } from '../Models/Admin/activity-log.model';
import { environment } from '../../../environments/environment';
import { mapActivityLogResponse } from '../Models/Admin/activity-log.mapper';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {

  private readonly endpoint = `${environment.apiUrl}/Admin/activity-logs`;

  constructor(private readonly http: HttpClient) {}

  getActivityLog(take: number = 20, role: string = 'all'): Observable<ActivityLogResponse> {
    const params = new HttpParams()
      .set('take', take)
      .set('role', role);

    return this.http
      .get<ApiActivityLogResponseDto>(this.endpoint, { params })
      .pipe(map(response => mapActivityLogResponse(response)));
  }
}