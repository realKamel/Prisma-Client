import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { DashboardResponse, 
  StatsHistoryDto, 
  StreakTasks, 
  PracticeRound, 
  PracticeAnswerRequest,
  PracticeAnswerResult,
  PracticeFinishResult
} from '../../../models/dashboard.models';

@Service()
export class DashboardService {
  private http = inject(HttpClient);
  getStatsHistory(): Observable<StatsHistoryDto> {
    return this.http.get<StatsHistoryDto>(`${environment.apiUrl}/students/dashboard/stats-history`);
  }
  public getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/students/dashboard/`);
  }

  getStreakTasks(): Observable<StreakTasks> {
    return this.http.get<StreakTasks>(`${environment.apiUrl}/students/streak-tasks`);
  }
  getPracticeRound(): Observable<PracticeRound> {
    return this.http.get<PracticeRound>(`${environment.apiUrl}/students/practice`);
  }
  finishPractice() {
    return this.http.post<PracticeFinishResult>(`${environment.apiUrl}/students/practice/finish`,{});
  }
  answerPractice(body: PracticeAnswerRequest): Observable<PracticeAnswerResult> {
    return this.http.post<PracticeAnswerResult>(`${environment.apiUrl}/students/practice/answer`, body);
  }
}
