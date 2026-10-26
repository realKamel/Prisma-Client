import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Stat } from '../models/stat';

@Service()
export class StatusService {
  private http = inject(HttpClient);
  getStatus(): Observable<Stat[]> {
    return this.http.get<Stat[]>('http://localhost:3000/stats');
  }
}
