import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { DashboardResponse, 
  StatsHistoryDto, 

} from '../../../models/dashboard.models';

@Service()
export class DashboardService {
  private http = inject(HttpClient);
  getStatsHistory(): Observable<StatsHistoryDto> {
    return this.http.get<StatsHistoryDto>(`${environment.apiUrl}/students/dashboard/stats-history`);
  }
  public getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/students/dashboard/`);
  }
}
