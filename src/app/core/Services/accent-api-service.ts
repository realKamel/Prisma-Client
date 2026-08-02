import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { AccentColor, AccentColorModel } from '../Models/Accent-color-model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Service()
export class AccentApiService {
  private http = inject(HttpClient);

  getAccentColor(): Observable<AccentColorModel> {
    return this.http.get<AccentColorModel>(`${environment.apiUrl}/preferences/accent`, {
      params: { teacherEmail: environment.teacherEmail },
    });
  }

  updateAccentColor(accentColor: AccentColor): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/teacher/preferences/accent`, {
      accentColor,
    });
  }
}
