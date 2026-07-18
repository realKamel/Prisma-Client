import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../Models/ApiResponse';
import { DashboardResponse } from '../Models/Student/Dashboard.Models';
import { environment } from '../../../environments/environment';

@Service()
export class DashboardService {
  private http = inject(HttpClient);
  getDashboard(): Observable<ApiResponse<DashboardResponse>> {
    return this.http.get<ApiResponse<DashboardResponse>>(
      `${environment.apiUrl}/students/dashboard/`,
    );
  }
}
