import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LogResponse } from '../Models/Assistant/log.model';
import { environment } from '../../../environments/environment';

@Service()
export class LogService {
  private http = inject(HttpClient);

  // Real endpoint: `${environment.apiUrl}/Assistants/detailed-logs`
  private readonly API_URL = `${environment.apiUrl}/Assistants/detailed-logs`;

  getLogs(take: number): Observable<LogResponse> {
    const params = new HttpParams().set('take', take);
    return this.http.get<LogResponse>(this.API_URL, { params });
  }
}
