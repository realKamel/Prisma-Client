import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../Models/Student/Dashboard.Models';
import { environment } from '../../../environments/environment';

@Service()
export class DashboardService {
  private http = inject(HttpClient);
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/students/dashboard/`);
  }
}
