import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Stat } from '../Models/stat';

@Service()
export class StatusService {
  private http = inject(HttpClient);
  getStatus(): Observable<Stat[]> {
    return this.http.get<Stat[]>('http://localhost:3000/stats');
  }
}
