import { inject, Injectable, signal } from '@angular/core';
import { PlatformConfig } from '../Models/platform-config';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../Models/ApiResponse';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);

  config = signal<PlatformConfig | null>(null);
  errorMessage = signal<string | null>(null);

  load() {
    return this.http
      .get<
        ApiResponse<PlatformConfig>
      >(`${environment.apiUrl}/LandingPage/export/${environment.teacherId}`)
      .pipe(
        tap((response) => {
          if (response.succeeded && response.data) {
            this.config.set(response.data);
          } else {
            this.errorMessage.set(response.message ?? 'حدث خطأ غير متوقع');
          }
        }),
        catchError((err) => {
          this.errorMessage.set('حدث خطأ، يرجى المحاولة لاحقاً');
          return throwError(() => err);
        }),
      );
  }
}
