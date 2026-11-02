import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { GetTeacherDashboardResponse,GetTeacherDashboardGraphResponse } from '../models/dashboard.model';

@Service()
export class TeacherServices {
  private readonly http = inject(HttpClient);

  GetDashboardData(): Observable<GetTeacherDashboardResponse> {
    return this.http.get<GetTeacherDashboardResponse>(`${environment.apiUrl}/Teachers/new-dashboard`);
  }

  GetDashboardGraphData(): Observable<GetTeacherDashboardGraphResponse> {
    return this.http.get<GetTeacherDashboardGraphResponse>(`${environment.apiUrl}/Teachers/new-dashboard-graph`);
  }
}
