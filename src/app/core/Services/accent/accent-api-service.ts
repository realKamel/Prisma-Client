import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AccentColor, AccentColorModel } from '../../models/accent-color.model';

@Service()
export class AccentApiService {
  private http = inject(HttpClient);

  public getAccentColor(): Observable<AccentColorModel> {
    return this.http.get<AccentColorModel>(`${environment.apiUrl}/preferences/accent`, {
      params: { teacherEmail: environment.teacherEmail },
    });
  }

  public updateAccentColor(accentColor: AccentColor) {
    return this.http.put(`${environment.apiUrl}/PlatformConfigurations/accent`, {
      accentColor,
    });
  }
}
