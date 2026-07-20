import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../Models/ApiResponse';
import { Observable } from 'rxjs';
import { AccentColor, AccentColorModel } from '../Models/Accent-color-model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccentApiService {
  private http = inject(HttpClient);

  getAccentColor(): Observable<ApiResponse<AccentColorModel>> {
    return this.http.get<ApiResponse<AccentColorModel>>(
      `${environment.apiUrl}/preferences/accent`,
      {
        params: { teacherEmail: environment.teacherEmail },
      },
    );
  }

  updateAccentColor(accentColor: AccentColor): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${environment.apiUrl}/teacher/preferences/accent`, {
      accentColor,
    });
  }
}
