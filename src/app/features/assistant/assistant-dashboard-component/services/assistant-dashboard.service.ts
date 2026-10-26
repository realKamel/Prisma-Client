import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ApiAssistantDashboardResponse,
  mapDashboardResponse,
} from '../../models/assistant-dashboard.mapper';
import { AssistantDashboardData } from '../../models/assistant-dashboard.model';

@Service()
export class AssistantDashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Assistants/dashboard`;
  private data$?: Observable<AssistantDashboardData>;

  public getDashboardData(): Observable<AssistantDashboardData> {
    if (!this.data$) {
      this.data$ = this.http.get<ApiAssistantDashboardResponse>(this.apiUrl).pipe(
        map((res) => mapDashboardResponse(res)),
        shareReplay(1),
      );
    }
    return this.data$;
  }
}
