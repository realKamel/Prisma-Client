import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityLogResponse } from '../Models/Admin/activity-log.model';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  /**
   * For now this points at the static JSON fixture in /assets/data,
   * so the page works without a backend.
   *
   * Once the real endpoint exists, swap this single line for something like:
   *   private readonly endpoint = `${environment.apiBaseUrl}/admin/activity-log`;
   *
   * ActivityLogResponse below is exactly the shape the backend should return
   * (stats + events), so no other code in this feature needs to change.
   */
  private readonly endpoint = 'assets/data/activity-log.json';

  constructor(private readonly http: HttpClient) {}

  getActivityLog(): Observable<ActivityLogResponse> {
    return this.http.get<ActivityLogResponse>(this.endpoint);
  }
}
