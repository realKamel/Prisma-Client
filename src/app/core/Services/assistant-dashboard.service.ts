import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { AssistantDashboardData } from '../Models/Assistant/assistant-dashboard.model';
import { environment } from '../../../environments/environment';
import {
  ApiAssistantDashboardResponse,
  mapDashboardResponse,
} from '../Models/Assistant/assistant-dashboard.mapper';

@Service()
export class AssistantDashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Assistants/dashboard`;
  private data$?: Observable<AssistantDashboardData>;

  getDashboardData(): Observable<AssistantDashboardData> {
    if (!this.data$) {
      this.data$ = this.http.get<ApiAssistantDashboardResponse>(this.apiUrl).pipe(
        map((res) => mapDashboardResponse(res)),
        shareReplay(1),
      );
    }
    return this.data$;
  }
}
