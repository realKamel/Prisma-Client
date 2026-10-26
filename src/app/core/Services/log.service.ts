import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogResponse } from '../models/assistant/log.model';

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
