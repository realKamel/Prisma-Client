import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../Models/ApiResponse';
import { LogResponse } from '../Models/Assistant/log.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LogService {
  // Real endpoint: `${environment.apiUrl}/Assistants/detailed-logs`
  private readonly API_URL = `${environment.apiUrl}/Assistants/detailed-logs`;

  constructor(private http: HttpClient) {}

  getLogs(take: number): Observable<LogResponse> {
    // ✅ لازم يكون كده بالظبط، مش Observable<ApiResponse<LogResponse>>
    const params = new HttpParams().set('take', take);
    return this.http
      .get<ApiResponse<LogResponse>>(this.API_URL, { params })
      .pipe(map((response) => response.data!)); // 👈 لاحظي علامة ! بعد .data
  }
}
