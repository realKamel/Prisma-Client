import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResponse } from '../Models/Student/Dashboard.Models';

@Service()
export class DashboardService {
  private http = inject(HttpClient);
  public getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/students/dashboard/`);
  }
}
