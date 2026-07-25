import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { GetTeacherDashboardStatusResponse } from '../models/dashboard.model';
import { ApiResponse } from '../../../../../core/Models/ApiResponse';

@Service()
export class TeacherServices {
  private readonly http = inject(HttpClient);

  public GetDashboardData(): Observable<ApiResponse<GetTeacherDashboardStatusResponse>> {
    return this.http.get<ApiResponse<GetTeacherDashboardStatusResponse>>(
      `${environment.apiUrl}/Teachers/dashboard`,
    );
  }
}
