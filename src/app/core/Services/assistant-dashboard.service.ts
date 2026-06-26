import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { AssistantDashboardData } from '../Models/Assistant/assistant-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AssistantDashboardService {
  private http = inject(HttpClient);

  // 🔁 Swap this URL with your real API endpoint when ready:
  // private readonly apiUrl = 'https://your-api.com/api/assistant/dashboard';
  private readonly apiUrl = 'assets/data/assistant-dashboard.json';

  private data$?: Observable<AssistantDashboardData>;

  getDashboardData(): Observable<AssistantDashboardData> {
    if (!this.data$) {
      this.data$ = this.http
        .get<AssistantDashboardData>(this.apiUrl)
        .pipe(shareReplay(1));
    }
    return this.data$;
  }
}
