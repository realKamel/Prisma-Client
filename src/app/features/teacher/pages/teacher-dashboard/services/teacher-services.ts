import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { GetTeacherDashboardStatusResponse } from '../models/dashboard.model';

@Service()
export class TeacherServices {
  private readonly http = inject(HttpClient);

  public GetDashboardData(): Observable<GetTeacherDashboardStatusResponse> {
    return this.http.get<GetTeacherDashboardStatusResponse>(
      `${environment.apiUrl}/Teachers/dashboard`,
    );
  }
}
